import { requireSupabase } from './supabase';

const PAGE_SIZE = 1000;

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function throwQueryError(label, error) {
  if (error) {
    throw new Error(`No se pudieron cargar ${label}: ${error.message}`);
  }
}

async function fetchAllRows(client, table, columns) {
  const rows = [];

  for (let start = 0; ; start += PAGE_SIZE) {
    const { data, error } = await client
      .from(table)
      .select(columns)
      .range(start, start + PAGE_SIZE - 1);

    throwQueryError(`datos de ${table}`, error);
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE_SIZE) break;
  }

  return rows;
}

function isMissingColumn(error) {
  return ['42703', 'PGRST204', 'PGRST200'].includes(error?.code);
}

async function loadProfiles(client, userIds) {
  if (!userIds.length) return new Map();

  let { data, error } = await client
    .from('profiles')
    .select('id, username')
    .in('id', userIds);

  if (error && isMissingColumn(error)) {
    ({ data, error } = await client
      .from('profiles')
      .select('user_id, username')
      .in('user_id', userIds));
    throwQueryError('perfiles de jugadores en profiles', error);
    return new Map(
      (data ?? []).map((profile) => [String(profile.user_id), profile.username]),
    );
  }

  throwQueryError('perfiles de jugadores en profiles', error);
  const profiles = new Map(
    (data ?? []).map((profile) => [String(profile.id), profile.username]),
  );
  const missingIds = userIds.filter((userId) => !profiles.has(userId));

  if (missingIds.length) {
    const alternate = await client
      .from('profiles')
      .select('user_id, username')
      .in('user_id', missingIds);
    if (alternate.error && !isMissingColumn(alternate.error)) {
      throwQueryError('perfiles de jugadores en profiles', alternate.error);
    }
    for (const profile of alternate.data ?? []) {
      profiles.set(String(profile.user_id), profile.username);
    }
  }

  return profiles;
}

export async function loadAnalytics(userId) {
  const client = requireSupabase();
  const [gameRows, answerRows, trackRows] = await Promise.all([
    fetchAllRows(
      client,
      'games',
      'id, user_id, score, correct_answers, total_questions, duration_seconds, created_at',
    ),
    fetchAllRows(
      client,
      'game_answers',
      'track_id, is_correct, response_time_ms',
    ),
    fetchAllRows(client, 'tracks', 'id, title, artist'),
  ]);

  const games = gameRows.map((game) => ({
    ...game,
    score: toNumber(game.score),
    correct_answers: toNumber(game.correct_answers),
    total_questions: toNumber(game.total_questions),
    duration_seconds: toNumber(game.duration_seconds),
  }));

  const answers = answerRows.map((answer) => ({
    ...answer,
    response_time_ms:
      answer.response_time_ms !== null &&
      answer.response_time_ms !== undefined &&
      Number.isFinite(Number(answer.response_time_ms))
      ? Number(answer.response_time_ms)
      : null,
    is_correct: answer.is_correct === true,
  }));

  const players = new Map();
  for (const game of games) {
    if (!game.user_id) continue;
    const playerId = String(game.user_id);
    const player = players.get(playerId) ?? {
      userId: playerId,
      gamesPlayed: 0,
      totalScore: 0,
      bestScore: 0,
      correctAnswers: 0,
      totalQuestions: 0,
    };

    player.gamesPlayed += 1;
    player.totalScore += game.score;
    player.bestScore = Math.max(player.bestScore, game.score);
    player.correctAnswers += game.correct_answers;
    player.totalQuestions += game.total_questions;
    players.set(playerId, player);
  }

  const rankedPlayers = [...players.values()]
    .sort((a, b) =>
      b.bestScore - a.bestScore ||
      (b.totalQuestions ? b.correctAnswers / b.totalQuestions : 0) -
        (a.totalQuestions ? a.correctAnswers / a.totalQuestions : 0) ||
      b.gamesPlayed - a.gamesPlayed,
    )
    .slice(0, 10);
  const profiles = await loadProfiles(
    client,
    rankedPlayers.map((player) => player.userId),
  );

  const leaderboard = rankedPlayers.map((player) => ({
    ...player,
    username: String(profiles.get(player.userId) || 'Jugador sin perfil'),
    accuracyPercent: player.totalQuestions
      ? (player.correctAnswers / player.totalQuestions) * 100
      : 0,
  }));

  const answersByTrack = new Map();
  for (const answer of answers) {
    const trackId = String(answer.track_id);
    const stats = answersByTrack.get(trackId) ?? {
      plays: 0,
      correct: 0,
      responseTotalMs: 0,
      timedResponses: 0,
    };

    stats.plays += 1;
    if (answer.is_correct) stats.correct += 1;
    if (answer.response_time_ms !== null && answer.response_time_ms >= 0) {
      stats.responseTotalMs += answer.response_time_ms;
      stats.timedResponses += 1;
    }
    answersByTrack.set(trackId, stats);
  }

  const trackPerformance = trackRows
    .map((track) => {
      const stats = answersByTrack.get(String(track.id)) ?? {
        plays: 0,
        correct: 0,
        responseTotalMs: 0,
        timedResponses: 0,
      };
      return {
        id: track.id,
        title: track.title || 'Canción sin título',
        artist: track.artist || '',
        plays: stats.plays,
        correct: stats.correct,
        accuracyPercent: stats.plays ? (stats.correct / stats.plays) * 100 : null,
        averageResponseSeconds: stats.timedResponses
          ? stats.responseTotalMs / stats.timedResponses / 1000
          : null,
      };
    })
    .sort((a, b) => {
      if (a.accuracyPercent === null) return b.accuracyPercent === null ? a.title.localeCompare(b.title) : 1;
      if (b.accuracyPercent === null) return -1;
      return b.accuracyPercent - a.accuracyPercent || b.plays - a.plays;
    });

  const responseTimes = answers
    .map((answer) => answer.response_time_ms)
    .filter((time) => time !== null && time >= 0);
  const totalCorrect = answers.filter((answer) => answer.is_correct).length;
  const myGames = userId
    ? games
        .filter((game) => String(game.user_id) === String(userId))
        .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    : [];

  return {
    summary: {
      totalGames: games.length,
      averageScore: games.length
        ? games.reduce((sum, game) => sum + game.score, 0) / games.length
        : 0,
      accuracyPercent: answers.length ? (totalCorrect / answers.length) * 100 : 0,
      averageResponseSeconds: responseTimes.length
        ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length / 1000
        : null,
    },
    leaderboard,
    trackPerformance,
    myGames,
  };
}

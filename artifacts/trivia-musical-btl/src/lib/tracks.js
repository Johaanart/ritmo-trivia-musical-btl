import { requireSupabase } from './supabase';

const QUESTION_COUNT = 5;
const OPTION_COUNT = 4;

function shuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function toTrack(row) {
  if (
    row?.id == null ||
    typeof row.title !== 'string' ||
    !row.title.trim() ||
    typeof row.audio_url !== 'string' ||
    !row.audio_url.trim()
  ) {
    return null;
  }

  const title = row.title.trim();
  const artist = typeof row.artist === 'string' ? row.artist.trim() : '';

  return {
    id: row.id,
    title,
    artist,
    audioUrl: row.audio_url.trim(),
    optionLabel: artist ? `${title} — ${artist}` : title,
  };
}

export async function loadRandomQuestions() {
  const client = requireSupabase();
  const { data, error } = await client
    .from('tracks')
    .select('id, title, artist, audio_url');

  if (error) {
    throw new Error(`No se pudieron cargar las pistas: ${error.message}`);
  }

  const uniqueTracks = [
    ...new Map(
      (data ?? [])
        .map(toTrack)
        .filter(Boolean)
        .map((track) => [track.optionLabel, track]),
    ).values(),
  ];

  if (uniqueTracks.length < QUESTION_COUNT) {
    throw new Error(
      'Se necesitan al menos 5 pistas con título y audio_url válidos en la tabla tracks.',
    );
  }

  const allTracks = shuffle(uniqueTracks);
  const selectedTracks = allTracks.slice(0, QUESTION_COUNT);

  return selectedTracks.map((correctTrack) => {
    const distractors = shuffle(
      allTracks.filter((track) => track.id !== correctTrack.id),
    ).slice(0, OPTION_COUNT - 1);
    const options = shuffle([correctTrack, ...distractors]);

    return {
      id: String(correctTrack.id),
      trackId: correctTrack.id,
      prompt: '¿Qué canción suena?',
      hint: 'Escucha la pista y selecciona el título correcto.',
      audioSrc: correctTrack.audioUrl,
      options: options.map((track) => track.optionLabel),
      answer: options.findIndex((track) => track.id === correctTrack.id),
    };
  });
}

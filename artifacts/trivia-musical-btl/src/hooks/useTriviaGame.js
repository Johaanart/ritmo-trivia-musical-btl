import { useCallback, useEffect, useRef, useState } from 'react';
import { requireSupabase } from '../lib/supabase';
import { loadRandomQuestions } from '../lib/tracks';

const QUESTION_SECONDS = 15;
const QUESTION_COUNT = 5;

export function useTriviaGame() {
  const [screen, setScreen] = useState('home');
  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answersCorrect, setAnswersCorrect] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(QUESTION_SECONDS);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [answerRecords, setAnswerRecords] = useState([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [trackError, setTrackError] = useState('');
  const [saveStatus, setSaveStatus] = useState('idle');
  const [saveError, setSaveError] = useState('');
  const [runId, setRunId] = useState(0);
  const questionStartedAt = useRef(0);
  const gameStartedAt = useRef(0);
  const gameFinishedAt = useRef(0);
  const loadingRef = useRef(false);
  const persistenceRef = useRef({
    runId: 0,
    gameId: null,
    answersSaved: false,
    complete: false,
    saving: false,
  });

  const question = questions[questionIndex] ?? null;
  const answered = selectedAnswer !== null || timedOut;

  const recordAnswer = useCallback((answerIndex, isTimeout = false) => {
    if (!question) return;
    const now = Date.now();
    const isCorrect = !isTimeout && answerIndex === question.answer;
    const responseTimeMs = Math.max(
      0,
      Math.min(QUESTION_SECONDS * 1000, now - questionStartedAt.current),
    );

    setAnswerRecords((records) => [
      ...records,
      {
        track_id: question.trackId,
        selected_option: isTimeout ? null : question.options[answerIndex],
        is_correct: isCorrect,
        response_time_ms: responseTimeMs,
      },
    ]);
    return isCorrect;
  }, [question]);

  const startGame = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoadingTracks(true);
    setTrackError('');
    setScreen('home');

    try {
      const loadedQuestions = await loadRandomQuestions();
      const startedAt = Date.now();
      setQuestions(loadedQuestions);
      setQuestionIndex(0);
      setScore(0);
      setAnswersCorrect(0);
      setSelectedAnswer(null);
      setSecondsLeft(QUESTION_SECONDS);
      setTimedOut(false);
      setAnswerRecords([]);
      setSaveStatus('idle');
      setSaveError('');
      gameStartedAt.current = startedAt;
      gameFinishedAt.current = 0;
      questionStartedAt.current = startedAt;
      setRunId((current) => {
        const nextRunId = current + 1;
        persistenceRef.current = {
          runId: nextRunId,
          gameId: null,
          answersSaved: false,
          complete: false,
          saving: false,
        };
        return nextRunId;
      });
      setIsPlaying(true);
      setScreen('game');
    } catch (error) {
      setTrackError(error instanceof Error ? error.message : 'Error inesperado al cargar las pistas.');
    } finally {
      loadingRef.current = false;
      setLoadingTracks(false);
    }
  }, []);

  useEffect(() => {
    if (screen !== 'game' || answered || !question) return undefined;
    let remaining = QUESTION_SECONDS;
    const timer = window.setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        recordAnswer(null, true);
        setTimedOut(true);
        setIsPlaying(false);
        setSecondsLeft(0);
        window.clearInterval(timer);
        return;
      }
      setSecondsLeft(remaining);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [screen, answered, questionIndex, question, recordAnswer]);

  const chooseAnswer = useCallback((answerIndex) => {
    if (screen !== 'game' || answered || !question) return;
    setSelectedAnswer(answerIndex);
    setIsPlaying(false);
    const isCorrect = recordAnswer(answerIndex);
    if (isCorrect) {
      setAnswersCorrect((value) => value + 1);
      setScore((value) => value + 100 + secondsLeft * 10);
    }
  }, [answered, question, recordAnswer, screen, secondsLeft]);

  const togglePlayback = useCallback(() => {
    if (screen !== 'game' || answered) return;
    setIsPlaying((playing) => !playing);
  }, [answered, screen]);

  const stopPlayback = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const nextQuestion = useCallback(() => {
    if (!answered) return;
    if (questionIndex === questions.length - 1) {
      gameFinishedAt.current = Date.now();
      setScreen('results');
      setIsPlaying(false);
      return;
    }
    setQuestionIndex((index) => index + 1);
    setSelectedAnswer(null);
    setTimedOut(false);
    setSecondsLeft(QUESTION_SECONDS);
    questionStartedAt.current = Date.now();
    setIsPlaying(true);
  }, [answered, questionIndex, questions.length]);

  const saveResult = useCallback(async (userId) => {
    if (
      !userId ||
      screen !== 'results' ||
      !runId ||
      answerRecords.length !== questions.length
    ) {
      return;
    }

    const persistence = persistenceRef.current;
    if (persistence.runId !== runId || persistence.complete || persistence.saving) return;

    persistence.saving = true;
    setSaveStatus('saving');
    setSaveError('');

    try {
      const client = requireSupabase();
      if (!persistence.gameId) {
        const { data, error } = await client
          .from('games')
          .insert({
            user_id: userId,
            score,
            correct_answers: answersCorrect,
            total_questions: questions.length,
            duration_seconds: Math.max(
              0,
              Math.floor((gameFinishedAt.current - gameStartedAt.current) / 1000),
            ),
          })
          .select('id')
          .single();

        if (error) throw error;
        persistence.gameId = data.id;
      }

      if (!persistence.answersSaved) {
        const { error } = await client.from('game_answers').insert(
          answerRecords.map((answer) => ({
            game_id: persistence.gameId,
            ...answer,
          })),
        );
        if (error) throw error;
        persistence.answersSaved = true;
      }

      persistence.complete = true;
      setSaveStatus('saved');
    } catch (error) {
      setSaveError(
        `No se pudo guardar la partida en Supabase: ${
          error instanceof Error ? error.message : 'error inesperado'
        }`,
      );
      setSaveStatus('error');
    } finally {
      persistence.saving = false;
    }
  }, [answerRecords, answersCorrect, questions.length, runId, score, screen]);

  return {
    screen,
    question,
    questionIndex,
    totalQuestions: questions.length || QUESTION_COUNT,
    score,
    answersCorrect,
    selectedAnswer,
    secondsLeft,
    isPlaying,
    answered,
    timedOut,
    loadingTracks,
    trackError,
    saveStatus,
    saveError,
    runId,
    startGame,
    chooseAnswer,
    togglePlayback,
    nextQuestion,
    stopPlayback,
    saveResult,
  };
}

import { useCallback, useEffect, useState } from 'react';
import { questions } from '../data/questions';

const QUESTION_SECONDS = 15;

export function useTriviaGame() {
  const [screen, setScreen] = useState('home');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answersCorrect, setAnswersCorrect] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(QUESTION_SECONDS);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  const question = questions[questionIndex];
  const answered = selectedAnswer !== null || timedOut;

  const stopPlayback = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const startGame = useCallback(() => {
    setQuestionIndex(0);
    setScore(0);
    setAnswersCorrect(0);
    setSelectedAnswer(null);
    setSecondsLeft(QUESTION_SECONDS);
    setTimedOut(false);
    setIsPlaying(true);
    setScreen('game');
  }, []);

  useEffect(() => {
    if (screen !== 'game' || answered) return undefined;
    let remaining = secondsLeft;
    const timer = window.setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
          setTimedOut(true);
          setIsPlaying(false);
          setSecondsLeft(0);
          window.clearInterval(timer);
          return;
      }
      setSecondsLeft(remaining);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [screen, answered, questionIndex]);

  const chooseAnswer = useCallback((answerIndex) => {
    if (screen !== 'game' || answered) return;
    setSelectedAnswer(answerIndex);
    setIsPlaying(false);
    if (answerIndex === question.answer) {
      setAnswersCorrect((value) => value + 1);
      setScore((value) => value + 100 + secondsLeft * 10);
    }
  }, [answered, question, screen, secondsLeft]);

  const togglePlayback = useCallback(() => {
    if (screen !== 'game' || answered) return;
    setIsPlaying((playing) => !playing);
  }, [answered, screen]);

  const nextQuestion = useCallback(() => {
    if (!answered) return;
    if (questionIndex === questions.length - 1) {
      setScreen('results');
      setIsPlaying(false);
      return;
    }
    setQuestionIndex((index) => index + 1);
    setSelectedAnswer(null);
    setTimedOut(false);
    setSecondsLeft(QUESTION_SECONDS);
    setIsPlaying(true);
  }, [answered, questionIndex]);

  return {
    screen, question, questionIndex, totalQuestions: questions.length, score,
    answersCorrect, selectedAnswer, secondsLeft, isPlaying, answered, timedOut,
    startGame, chooseAnswer, togglePlayback, nextQuestion, stopPlayback,
  };
}

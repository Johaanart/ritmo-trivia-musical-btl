export interface TriviaQuestion {
  id: string;
  prompt: string;
  hint: string;
  audioSrc: string | null;
  demoMelody: [number, number][];
  options: string[];
  answer: number;
}

export interface TriviaGameState {
  screen: 'home' | 'game' | 'results';
  question: TriviaQuestion;
  questionIndex: number;
  totalQuestions: number;
  score: number;
  answersCorrect: number;
  selectedAnswer: number | null;
  secondsLeft: number;
  isPlaying: boolean;
  answered: boolean;
  timedOut: boolean;
  startGame: () => void;
  chooseAnswer: (answerIndex: number) => void;
  togglePlayback: () => void;
  nextQuestion: () => void;
  stopPlayback: () => void;
}

export function useTriviaGame(): TriviaGameState;

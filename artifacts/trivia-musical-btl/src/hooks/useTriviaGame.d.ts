export interface TriviaQuestion {
  id: string;
  prompt: string;
  hint: string;
  trackId: string | number;
  audioSrc: string;
  options: string[];
  answer: number;
}

export interface GameAnswerRecord {
  track_id: string | number;
  selected_option: string | null;
  is_correct: boolean;
  response_time_ms: number;
}

export interface TriviaGameState {
  screen: 'home' | 'game' | 'results';
  question: TriviaQuestion | null;
  questionIndex: number;
  totalQuestions: number;
  score: number;
  answersCorrect: number;
  selectedAnswer: number | null;
  secondsLeft: number;
  isPlaying: boolean;
  answered: boolean;
  timedOut: boolean;
  loadingTracks: boolean;
  trackError: string;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  saveError: string;
  runId: number;
  startGame: () => Promise<void>;
  chooseAnswer: (answerIndex: number) => void;
  togglePlayback: () => void;
  nextQuestion: () => void;
  stopPlayback: () => void;
  saveResult: (userId: string) => Promise<void>;
}

export function useTriviaGame(): TriviaGameState;

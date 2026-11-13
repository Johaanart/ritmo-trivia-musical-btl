export interface AnalyticsGame {
  id: string | number;
  user_id: string | null;
  score: number;
  correct_answers: number;
  total_questions: number;
  duration_seconds: number;
  created_at: string | null;
}

export interface PlayerRanking {
  userId: string;
  username: string;
  gamesPlayed: number;
  totalScore: number;
  bestScore: number;
  accuracyPercent: number;
}

export interface TrackPerformance {
  id: string | number;
  title: string;
  artist: string;
  plays: number;
  correct: number;
  accuracyPercent: number | null;
  averageResponseSeconds: number | null;
}

export interface AnalyticsData {
  summary: {
    totalGames: number;
    averageScore: number;
    accuracyPercent: number;
    averageResponseSeconds: number | null;
  };
  leaderboard: PlayerRanking[];
  trackPerformance: TrackPerformance[];
  myGames: AnalyticsGame[];
}

export function loadAnalytics(userId: string | null): Promise<AnalyticsData>;

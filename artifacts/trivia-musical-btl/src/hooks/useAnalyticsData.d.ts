import type { AnalyticsData } from '../lib/analytics';

export interface AnalyticsDataState {
  data: AnalyticsData | null;
  isLoading: boolean;
  error: string;
  refresh: () => void;
}

export function useAnalyticsData(userId: string | null): AnalyticsDataState;

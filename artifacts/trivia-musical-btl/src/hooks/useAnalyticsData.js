import { useCallback, useEffect, useState } from 'react';
import { loadAnalytics } from '../lib/analytics';

export function useAnalyticsData(userId) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((current) => current + 1);
  }, []);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError('');

    loadAnalytics(userId)
      .then((result) => {
        if (active) setData(result);
      })
      .catch((loadError) => {
        if (active) {
          setData(null);
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'No se pudieron cargar los datos de analítica.',
          );
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [refreshKey, userId]);

  return { data, isLoading, error, refresh };
}

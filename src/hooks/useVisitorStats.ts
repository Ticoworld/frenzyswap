// src/hooks/useVisitorStats.ts
'use client';

import { useEffect, useState } from 'react';
import { getVisitorStats } from '@/lib/analytics';

export function useVisitorStats(timeframe: '24h' | '7d' | '30d' | '365d' = '24h') {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getVisitorStats(timeframe)
      .then((data) => {
        setStats(data);
        setError(null);
      })
      .catch((err) => {
        setError('Failed to fetch visitor stats');
        setStats(null);
      })
      .finally(() => setLoading(false));
  }, [timeframe]);

  return { stats, loading, error };
}

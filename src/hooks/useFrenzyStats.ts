import useSWR from 'swr';

// Replace with your real backend endpoint when ready
const STATS_API = '/api/stats';

export type FrenzyStats = {
  totalVolume: number;
  activeUsers: number;
  totalBurned: number;
  averageFee: number;
};

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useFrenzyStats() {
  const { data, error, isLoading } = useSWR<FrenzyStats>(STATS_API, fetcher, {
    refreshInterval: 30000, // refresh every 30s
  });

  return {
    stats: data,
    loading: isLoading,
    error,
  };
}

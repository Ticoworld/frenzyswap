"use client";
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function useTopPairs(tf: '24h'|'7d'|'30d'|'all' = '7d', limit = 10) {
  const { data, error, isLoading } = useSWR(`/api/analytics-top?type=pairs&tf=${tf}&limit=${limit}`, fetcher)
  return { data: data?.data || [], isLoading, error };
}

export function useTopTokens(tf: '24h'|'7d'|'30d'|'all' = '7d', limit = 10) {
  const { data, error, isLoading } = useSWR(`/api/analytics-top?type=tokens&tf=${tf}&limit=${limit}`, fetcher)
  return { data: data?.data || [], isLoading, error };
}

export function useTopHours(tf: '24h'|'7d'|'30d'|'all' = '7d') {
  const { data, error, isLoading } = useSWR(`/api/analytics-top?type=hours&tf=${tf}`, fetcher)
  return { data: data?.data || [], isLoading, error };
}

export function useBiggestSwaps(tf: '24h'|'7d'|'30d'|'all' = '7d', limit = 10) {
  const { data, error, isLoading } = useSWR(`/api/analytics-top?type=biggest&tf=${tf}&limit=${limit}`, fetcher)
  return { data: data?.data || [], isLoading, error };
}

export function useMemeAggregates(tf: '24h'|'7d'|'30d'|'all' = '7d') {
  const { data, error, isLoading } = useSWR(`/api/meme-aggregates?tf=${tf}`, fetcher)
  return { data: data?.data || { volumeUsd: 0, feesUsd: 0, burns: 0 }, isLoading, error };
}

export function useTopProjects(tf: '24h'|'7d'|'30d'|'all' = '7d', limit = 10) {
  const { data, error, isLoading } = useSWR(`/api/analytics-top?type=projects&tf=${tf}&limit=${limit}`, fetcher)
  return { data: data?.data || [], isLoading, error };
}

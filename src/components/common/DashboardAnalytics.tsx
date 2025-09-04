"use client";

import useSWR from 'swr';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const fetcher = (url: string) => fetch(url).then(r=>r.json());

export default function DashboardAnalytics() {
  const { data } = useSWR('/api/analytics-timeseries?days=30', fetcher);
  const series = (data?.data || []).map((d: any) => ({ date: d.date, volume: Math.round(d.volumeUsd), fees: Math.round(d.feesUsd) }));
  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">30d Volume & Fees</h2>
      <div className="w-full h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ left: 8, right: 8, top: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="gradVol" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="gradFees" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.5}/>
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#94a3b8"/>
            <YAxis tick={{ fontSize: 10 }} width={50} stroke="#94a3b8" tickFormatter={(v)=>v>1000?`${Math.round(v/1000)}k`:`${v}`} />
            <Tooltip formatter={(v:any)=>`$${v.toLocaleString()}`} />
            <Area type="monotone" dataKey="volume" stroke="#6366f1" fill="url(#gradVol)" strokeWidth={2} />
            <Area type="monotone" dataKey="fees" stroke="#22c55e" fill="url(#gradFees)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Privacy respected. Opted-out and private users are excluded.</p>
    </section>
  );
}

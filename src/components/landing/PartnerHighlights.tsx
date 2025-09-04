"use client";
import Image from 'next/image';
import { useMemo } from 'react';
import { PARTNERS } from '@/config/partners';
import { useTopProjects } from '@/hooks/useTopAnalytics';
import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';

type ProjectDatum = { project: string; volume: number; trades: number; fees: number; traders: number };

export default function PartnerHighlights() {
  const { data, isLoading } = useTopProjects('7d', 200);
  const partnerRows = useMemo(() => {
    const rows = data as ProjectDatum[];
    // Build a map of alias -> metrics
    const lowerMap = new Map<string, ProjectDatum>();
    for (const r of rows) {
      lowerMap.set(String(r.project).toLowerCase(), r);
    }
    // For each partner, find the best matching alias
    return PARTNERS.map(p => {
      let best: ProjectDatum | null = null;
      for (const alias of p.aliases) {
        const hit = lowerMap.get(alias.toLowerCase());
        if (hit && (!best || hit.volume > best.volume)) best = hit;
      }
      return { partner: p, metrics: best };
    }).filter(x => !!x.metrics)
      .sort((a,b)=> (b.metrics!.volume - a.metrics!.volume))
      .slice(0, 6);
  }, [data]);

  return (
    <section className="py-12 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold">Partner Highlights</h2>
          <span className="text-sm text-gray-500">7d</span>
        </div>
        {isLoading ? (
          <div className="text-sm text-gray-500">Loading…</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {partnerRows.map(({ partner, metrics }) => (
              <div key={partner.id} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 p-4">
                <div className="flex items-center gap-3">
                  <Image src={partner.logo} alt={partner.name} width={28} height={28} className="rounded" />
                  <div className="font-semibold">{partner.name}</div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <div className="text-gray-500">Volume</div>
                    <div className="font-semibold">{`$${(metrics!.volume || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Trades</div>
                    <div className="font-semibold">{metrics!.trades.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Fees</div>
                    <div className="font-semibold">{`$${(metrics!.fees || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}</div>
                  </div>
                </div>
                <div className="mt-3 h-16">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { x: 0, v: metrics!.volume * 0.2 },
                      { x: 1, v: metrics!.volume * 0.4 },
                      { x: 2, v: metrics!.volume * 0.35 },
                      { x: 3, v: metrics!.volume * 0.6 },
                      { x: 4, v: metrics!.volume * 0.8 },
                      { x: 5, v: metrics!.volume },
                    ]}>
                      <Tooltip formatter={(v:number)=>`$${v.toLocaleString(undefined,{maximumFractionDigits:0})}`} labelFormatter={()=>''} cursor={false} />
                      <Area type="monotone" dataKey="v" stroke="#facc15" fill="#facc1540" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

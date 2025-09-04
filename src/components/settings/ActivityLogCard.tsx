"use client";
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useI18n } from '@/lib/i18n';

interface EventRow { id: string; event_type: string; created_at: string; metadata?: any; wallet_address?: string; ref_wallet_address?: string; }

export default function ActivityLogCard({ wallet }: { wallet?: string | null }) {
  const { t } = useI18n();
  const [rows, setRows] = useState<EventRow[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [start, setStart] = useState<string>('');
  const [end, setEnd] = useState<string>('');
  const [preset, setPreset] = useState<'7'|'30'|'90'|'custom'>('7');

  useEffect(() => {
    let abort = false;
    async function load() {
      try {
  const q = new URLSearchParams({ limit: '50', ...(filter !== 'all' ? { type: filter } : {}), ...(start ? { start } : {}), ...(end ? { end } : {}) });
        const res = await fetch(`/api/logs?${q.toString()}`, { headers: wallet ? { 'x-wallet': wallet } : undefined });
        if (!res.ok) return; // optional
        const json = await res.json();
        if (!abort) setRows(json.data || []);
      } catch {}
    }
    load();
    return () => { abort = true; };
  }, [wallet, filter, start, end]);

  useEffect(() => {
    if (preset === 'custom') return;
    const now = new Date();
    const days = preset === '7' ? 7 : preset === '30' ? 30 : 90;
    const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const isoLocal = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString().slice(0,16);
    setStart(isoLocal(from));
    setEnd(isoLocal(now));
  }, [preset]);

  const filtered = useMemo(() => rows, [rows]);

  async function exportLogs() {
    if (!wallet) { toast.error('Connect wallet'); return; }
    try {
      const res = await fetch(`/api/account?action=export`, { headers: { 'x-wallet': wallet } });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `frenzyswap-export-${wallet}.json`; a.click(); URL.revokeObjectURL(url);
    } catch (e: any) { toast.error(e?.message || 'Export failed'); }
  }

  function toCsv(data: EventRow[]) {
    const headers = ['id','event_type','created_at','wallet_address','ref_wallet_address'];
    const lines = [headers.join(',')].concat(data.map(r => [r.id, r.event_type, r.created_at, r.wallet_address||'', r.ref_wallet_address||''].map(v => `'${String(v).replace(/'/g, "''")}'`).join(',')));
    return lines.join('\n');
  }

  function exportCsv() {
    try {
      const csv = toCsv(rows);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'activity.csv'; a.click(); URL.revokeObjectURL(url);
    } catch { /* noop */ }
  }

  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700" aria-labelledby="activityHeading">
      <div className="flex items-center justify-between mb-2 gap-2">
        <h2 id="activityHeading" className="text-lg font-semibold text-gray-900 dark:text-white">{t('activity.title')}</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <select aria-label="Filter events" value={filter} onChange={e=>setFilter(e.target.value)} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded px-2 py-1">
            <option value="all">All</option>
            <option value="privacy">Privacy</option>
            <option value="referral">Referral</option>
            <option value="disconnect">Disconnect</option>
          </select>
          <label className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
            {t('activity.presets')}
            <select value={preset} onChange={e=>setPreset(e.target.value as any)} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded px-2 py-1">
              <option value="7">{t('preset.last7')}</option>
              <option value="30">{t('preset.last30')}</option>
              <option value="90">{t('preset.last90')}</option>
              <option value="custom">{t('preset.custom')}</option>
            </select>
          </label>
          <label className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
            {t('activity.start')}
            <input type="datetime-local" value={start} onChange={e=>{ setPreset('custom'); setStart(e.target.value); }} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded px-2 py-1" aria-label="Start date" />
          </label>
          <label className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
            {t('activity.end')}
            <input type="datetime-local" value={end} onChange={e=>{ setPreset('custom'); setEnd(e.target.value); }} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded px-2 py-1" aria-label="End date" />
          </label>
          <button onClick={exportLogs} className="px-3 py-1.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm export-json">{t('activity.exportJson')}</button>
          <button onClick={exportCsv} className="px-3 py-1.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm export-csv">{t('activity.exportCsv')}</button>
        </div>
      </div>
      <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2 max-h-64 overflow-auto" role="list">
        {filtered.map(e => (
          <li key={e.id} className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700/50 pb-2">
            <span className="capitalize">{String(e.event_type).replace(/_/g,' ')}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(e.created_at).toLocaleString()}</span>
          </li>
        ))}
        {!filtered.length && <li className="text-gray-500 dark:text-gray-400">No recent activity</li>}
      </ul>
      {/* TODO: implement /api/logs or query Supabase directly here with RLS-safe filters */}
    </section>
  );
}

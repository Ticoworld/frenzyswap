"use client";
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface SessionRow {
  session_id: string;
  wallet_address?: string;
  start_time?: string;
  last_activity?: string;
  end_time?: string;
  is_mobile?: boolean;
  user_agent?: string;
}

export default function SessionsCard({ wallet }: { wallet?: string | null }) {
  const [rows, setRows] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState<number>(30);
  const hasActive = rows.some(r => !r.end_time);

  const load = useCallback(async () => {
    if (!wallet) return;
    setLoading(true);
    try {
      const res = await fetch('/api/sessions', { headers: { 'x-wallet': wallet } });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to load sessions');
      // Filter to recent window
      const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
      const recent = (json.data || []).filter((r: SessionRow) => {
        const t = r.last_activity ? Date.parse(r.last_activity) : Date.now();
        return t >= cutoff;
      });
      setRows(recent);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load sessions');
    } finally { setLoading(false); }
  }, [wallet, days]);

  useEffect(() => { load(); }, [load]);

  async function revoke(session_id: string) {
    if (!wallet) return;
    try {
      const res = await fetch('/api/sessions', { method: 'DELETE', headers: { 'Content-Type': 'application/json', 'x-wallet': wallet }, body: JSON.stringify({ session_id }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to revoke');
      toast.success('Session revoked');
      setRows(prev => prev.map(r => r.session_id === session_id ? { ...r, end_time: new Date().toISOString() } : r));
    } catch (e: any) { toast.error(e?.message || 'Failed to revoke'); }
  }

  async function revokeAll() {
    if (!wallet) return;
    try {
      const res = await fetch('/api/sessions?all=1', { method: 'DELETE', headers: { 'Content-Type': 'application/json', 'x-wallet': wallet } });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to revoke all');
      toast.success('All sessions revoked');
      setRows([]);
    } catch (e: any) { toast.error(e?.message || 'Failed to revoke all'); }
  }

  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700" aria-labelledby="sessionsHeading">
      <div className="flex items-center justify-between mb-2">
        <h2 id="sessionsHeading" className="text-lg font-semibold text-gray-900 dark:text-white">Sessions & Devices</h2>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600 dark:text-gray-400">Show last
            <select value={days} onChange={e=>setDays(parseInt(e.target.value))} className="ml-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded px-1 py-0.5">
              <option value={7}>7d</option>
              <option value={30}>30d</option>
              <option value={90}>90d</option>
            </select>
          </label>
          <button onClick={load} disabled={loading || !wallet} className="px-3 py-1.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm disabled:opacity-50">Refresh</button>
          <button onClick={revokeAll} disabled={!wallet || !hasActive} className="px-3 py-1.5 rounded bg-red-100 dark:bg-red-700 text-red-700 dark:text-white hover:bg-red-200 dark:hover:bg-red-600 text-sm disabled:opacity-50" aria-disabled={!wallet || !hasActive}>Revoke All</button>
        </div>
      </div>
      {!wallet ? (
        <div className="text-sm text-gray-500 dark:text-gray-400">Connect a wallet to view sessions.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 dark:text-gray-400">
                <th className="py-2 pr-4">Session</th>
                <th className="py-2 pr-4">Started</th>
                <th className="py-2 pr-4">Last Activity</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Device</th>
                <th className="py-2 pr-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.session_id} className="border-t border-gray-200 dark:border-gray-700/50 text-gray-700 dark:text-gray-300">
                  <td className="py-2 pr-4 font-mono">{r.session_id.slice(0,8)}…</td>
                  <td className="py-2 pr-4">{r.start_time ? new Date(r.start_time).toLocaleString() : '-'}</td>
                  <td className="py-2 pr-4">{r.last_activity ? new Date(r.last_activity).toLocaleString() : '-'}</td>
                  <td className="py-2 pr-4">{r.end_time ? 'Revoked' : 'Active'}</td>
                  <td className="py-2 pr-4">{r.is_mobile ? 'Mobile' : 'Desktop'}</td>
                  <td className="py-2 pr-0 text-right">
                    <button onClick={() => revoke(r.session_id)} disabled={!!r.end_time} className="px-3 py-1 rounded bg-red-100 dark:bg-red-600 text-red-700 dark:text-white hover:bg-red-200 dark:hover:bg-red-500 disabled:opacity-50">Revoke</button>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr><td colSpan={6} className="py-3 text-gray-500 dark:text-gray-400">No sessions found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

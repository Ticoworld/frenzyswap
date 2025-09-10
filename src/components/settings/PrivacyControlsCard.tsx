"use client";
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function PrivacyControlsCard({ wallet }: { wallet?: string | null }) {
  const [hidePnl, setHidePnl] = useState(false);
  const [hideVolume, setHideVolume] = useState(false);
  const [hideBadges, setHideBadges] = useState(false);
  const [optOut, setOptOut] = useState(false);
  const [didMount, setDidMount] = useState(false);
  const [saving, setSaving] = useState<{ hide_pnl: boolean; hide_volume: boolean; hide_badges: boolean; analytics_opt_out: boolean }>({ hide_pnl: false, hide_volume: false, hide_badges: false, analytics_opt_out: false });

  useEffect(() => {
    try {
      setHidePnl(localStorage.getItem('frenzy_priv_hide_pnl') === '1');
      setHideVolume(localStorage.getItem('frenzy_priv_hide_volume') === '1');
      setHideBadges(localStorage.getItem('frenzy_priv_hide_badges') === '1');
      setOptOut(localStorage.getItem('frenzy_analytics_opt_out') === '1');
      // Load server settings if wallet available
      if (wallet) {
        fetch('/api/settings', { headers: { 'x-wallet': wallet } }).then(r => r.ok ? r.json() : null).then(json => {
          if (!json?.data) return;
          const s = json.data;
          if (typeof s.hide_pnl === 'boolean') setHidePnl(s.hide_pnl);
          if (typeof s.hide_volume === 'boolean') setHideVolume(s.hide_volume);
          if (typeof s.hide_badges === 'boolean') setHideBadges(s.hide_badges);
          if (typeof s.analytics_opt_out === 'boolean') setOptOut(s.analytics_opt_out);
        }).catch(()=>{});
      }
  } catch {}
  setDidMount(true);
  }, [wallet]);

  function persist(key: string, val: boolean) { try { localStorage.setItem(key, val ? '1' : '0'); } catch {} }
  async function sync(partial: Record<string, any>): Promise<boolean> {
    try {
      if (!wallet) return false;
      const key = Object.keys(partial)[0] as keyof typeof saving;
      setSaving(prev => ({ ...prev, [key]: true }));
      const res = await fetch('/api/settings', { method: 'PATCH', headers: { 'Content-Type':'application/json', 'x-wallet': wallet }, body: JSON.stringify(partial) });
      if (!res.ok) { throw new Error('Save failed'); }
      return true;
    } catch (e) {
      toast.error('Failed to save');
      return false;
    } finally {
      const key = Object.keys(partial)[0] as keyof typeof saving;
      setSaving(prev => ({ ...prev, [key]: false }));
    }
  }

  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700" aria-labelledby="privacyCtrlHeading">
      <h2 id="privacyCtrlHeading" className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Privacy Controls</h2>
      <div className="grid md:grid-cols-2 gap-4 text-sm">
        <label className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700/60 rounded p-3">
          <span className="text-gray-700 dark:text-gray-300">Hide P&L</span>
          <div className="flex items-center gap-2">
            {saving.hide_pnl && <span role="status" aria-live="polite" className="text-xs text-gray-500 dark:text-gray-400 italic">Saving…</span>}
            <input type="checkbox" checked={hidePnl} disabled={saving.hide_pnl} onChange={e => { const v = e.target.checked; setHidePnl(v); persist('frenzy_priv_hide_pnl', v); void sync({ hide_pnl: v }).then(ok => { if (ok && didMount) toast.success('Saved'); }); }} className="h-4 w-4 accent-frenzy dark:accent-gray-600 disabled:opacity-60" />
          </div>
        </label>
        <label className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700/60 rounded p-3">
          <span className="text-gray-700 dark:text-gray-300">Hide Volume</span>
          <div className="flex items-center gap-2">
            {saving.hide_volume && <span role="status" aria-live="polite" className="text-xs text-gray-500 dark:text-gray-400 italic">Saving…</span>}
            <input type="checkbox" checked={hideVolume} disabled={saving.hide_volume} onChange={e => { const v = e.target.checked; setHideVolume(v); persist('frenzy_priv_hide_volume', v); void sync({ hide_volume: v }).then(ok => { if (ok && didMount) toast.success('Saved'); }); }} className="h-4 w-4 accent-frenzy dark:accent-gray-600 disabled:opacity-60" />
          </div>
        </label>
        <label className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700/60 rounded p-3">
          <span className="text-gray-700 dark:text-gray-300">Hide Badges</span>
          <div className="flex items-center gap-2">
            {saving.hide_badges && <span role="status" aria-live="polite" className="text-xs text-gray-500 dark:text-gray-400 italic">Saving…</span>}
            <input type="checkbox" checked={hideBadges} disabled={saving.hide_badges} onChange={e => { const v = e.target.checked; setHideBadges(v); persist('frenzy_priv_hide_badges', v); void sync({ hide_badges: v }).then(ok => { if (ok && didMount) toast.success('Saved'); }); }} className="h-4 w-4 accent-frenzy dark:accent-gray-600 disabled:opacity-60" />
          </div>
        </label>
        <label className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700/60 rounded p-3">
          <span className="text-gray-700 dark:text-gray-300">Analytics opt-out</span>
          <div className="flex items-center gap-2">
            {saving.analytics_opt_out && <span role="status" aria-live="polite" className="text-xs text-gray-500 dark:text-gray-400 italic">Saving…</span>}
            <input type="checkbox" checked={optOut} disabled={saving.analytics_opt_out} onChange={e => { const v = e.target.checked; setOptOut(v); persist('frenzy_analytics_opt_out', v); void sync({ analytics_opt_out: v }).then(ok => { if (ok && didMount) toast.success('Saved'); }); }} className="h-4 w-4 accent-frenzy dark:accent-gray-600 disabled:opacity-60" />
          </div>
        </label>
      </div>
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">Preferences sync to your account when connected; we also keep them locally for offline use.</div>
    </section>
  );
}

"use client";
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useI18n } from '@/lib/i18n';
import NotificationsToggle from './NotificationsToggle';

const getB = (k: string) => { try { return localStorage.getItem(k) === '1'; } catch { return false; } };
const setB = (k: string, v: boolean) => { try { localStorage.setItem(k, v ? '1' : '0'); } catch {} };

export default function NotificationsCard() {
  const { t } = useI18n();
  const [txn, setTxn] = useState(false);
  const [ref, setRef] = useState(false);
  const [badge, setBadge] = useState(false);
  const [security, setSecurity] = useState(true);
  const [banner, setBanner] = useState(() => {
    try { return sessionStorage.getItem('notif_banner_dismissed') !== '1'; } catch { return true; }
  });
  const [didMount, setDidMount] = useState(false);

  useEffect(() => {
    setTxn(getB('frenzy_notif_txn'));
    setRef(getB('frenzy_notif_ref'));
    setBadge(getB('frenzy_notif_badge'));
    setSecurity(getB('frenzy_notif_sec'));
  setDidMount(true);
  }, []);

  async function sync(partial: Record<string, any>) {
    try {
      const wallet = localStorage.getItem('last_connected_wallet');
      if (!wallet) return;
      await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type':'application/json', 'x-wallet': wallet }, body: JSON.stringify(partial) });
    } catch {}
  }

  // Persist only on explicit user action to avoid toast spam on load
  const onTxnChange = (v: boolean) => { setTxn(v); setB('frenzy_notif_txn', v); sync({ notif_transactions: v }); toast.success('Saved'); };
  const onRefChange = (v: boolean) => { setRef(v); setB('frenzy_notif_ref', v); sync({ notif_referrals: v }); toast.success('Saved'); };
  const onBadgeChange = (v: boolean) => { setBadge(v); setB('frenzy_notif_badge', v); sync({ notif_badges: v }); toast.success('Saved'); };
  const onSecurityChange = (v: boolean) => { setSecurity(v); setB('frenzy_notif_sec', v); sync({ notif_security: v }); toast.success('Saved'); };

  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700" aria-labelledby="notifHeading">
      <h2 id="notifHeading" className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Notifications</h2>
    {banner && (
        <div className="mb-3 text-xs text-yellow-900 bg-yellow-100 border border-yellow-300 rounded p-2 flex items-start justify-between">
      <span>Notification delivery backend is not active yet. We’ll save your preferences and enable delivery soon.</span>
      <button onClick={()=>{ setBanner(false); try{ sessionStorage.setItem('notif_banner_dismissed','1'); }catch{} }} className="text-yellow-900 ml-2" aria-label="Dismiss">✕</button>
        </div>
      )}
    <div className="grid md:grid-cols-2 gap-4 text-sm">
        <label className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700/60 rounded p-3">
          <span className="text-gray-700 dark:text-gray-300">Transactions</span>
      <input type="checkbox" checked={txn} onChange={e=>onTxnChange(e.target.checked)} className="h-4 w-4 accent-frenzy dark:accent-gray-600" />
        </label>
        <label className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700/60 rounded p-3">
          <span className="text-gray-700 dark:text-gray-300">Referrals</span>
      <input type="checkbox" checked={ref} onChange={e=>onRefChange(e.target.checked)} className="h-4 w-4 accent-frenzy dark:accent-gray-600" />
        </label>
        <label className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700/60 rounded p-3">
          <span className="text-gray-700 dark:text-gray-300">Badges & rewards</span>
      <input type="checkbox" checked={badge} onChange={e=>onBadgeChange(e.target.checked)} className="h-4 w-4 accent-frenzy dark:accent-gray-600" />
        </label>
        <label className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700/60 rounded p-3">
          <span className="text-gray-700 dark:text-gray-300">Security alerts</span>
      <input type="checkbox" checked={security} onChange={e=>onSecurityChange(e.target.checked)} className="h-4 w-4 accent-frenzy dark:accent-gray-600" />
        </label>
      </div>
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">Delivery channels and server subscriptions coming soon. {/* TODO: wire to backend topics */}</div>
  <NotificationsToggle />
    </section>
  );
}

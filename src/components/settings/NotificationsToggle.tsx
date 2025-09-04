"use client";
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { subscribePush, getExistingSubscription } from '@/lib/webpush';

export default function NotificationsToggle() {
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    try { setEnabled(localStorage.getItem('frenzy_push_enabled') === '1'); } catch {}
  }, []);

  async function onToggle(v: boolean) {
    setBusy(true);
    try {
      const wallet = localStorage.getItem('last_connected_wallet');
      const vapid = process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY as string | undefined;
      if (!wallet || !vapid) { toast.error('Push not available'); return; }
      if (v) {
        const sub = await subscribePush(vapid);
        if (!sub) { toast.error('Subscribe failed'); return; }
        // Ensure we send plain JSON, not a live PushSubscription object
        const payload = (typeof (sub as any).toJSON === 'function') ? (sub as any).toJSON() : JSON.parse(JSON.stringify(sub));
        const res = await fetch('/api/push/subscribe', { method: 'POST', headers: { 'Content-Type':'application/json', 'x-wallet': wallet }, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error('subscribe backend failed');
        try { localStorage.setItem('frenzy_push_enabled','1'); } catch {}
        setEnabled(true);
        toast.success('Push enabled');
      } else {
        // Unsubscribe flow
        const sub = await getExistingSubscription();
        if (sub) {
          try {
            await fetch('/api/push/unsubscribe', { method: 'POST', headers: { 'Content-Type':'application/json', 'x-wallet': wallet }, body: JSON.stringify({ endpoint: sub.endpoint }) });
          } catch {}
          try { await sub.unsubscribe(); } catch {}
        }
        try { localStorage.removeItem('frenzy_push_enabled'); } catch {}
        setEnabled(false); toast('Push disabled');
      }
    } catch {
      toast.error('Error updating push');
    } finally { setBusy(false); }
  }

  return (
    <div className="mt-3 flex items-center justify-between bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700/60 rounded p-3 text-sm">
      <span className="text-gray-700 dark:text-gray-300">Enable Web Push</span>
      <input type="checkbox" disabled={busy} checked={enabled} onChange={e=>onToggle(e.target.checked)} className="h-4 w-4 accent-frenzy dark:accent-gray-600" />
    </div>
  );
}

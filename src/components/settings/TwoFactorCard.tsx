"use client";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';

export default function TwoFactorCard() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [token, setToken] = useState('');
  const [recovery, setRecovery] = useState<string[] | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const wallet = localStorage.getItem('last_connected_wallet');
        if (!wallet) return;
        const res = await fetch('/api/2fa', { headers: { 'x-wallet': wallet } });
        const json = await res.json();
        setEnabled(!!json.enabled);
      } catch {}
    })();
  }, []);

  async function start() {
    setBusy(true);
    try {
      const wallet = localStorage.getItem('last_connected_wallet');
      if (!wallet) return;
      const res = await fetch('/api/2fa?action=start', { method: 'POST', headers: { 'x-wallet': wallet } });
      const json = await res.json();
      setQr(json.qr);
      toast('Scan the QR in your authenticator app');
    } catch { toast.error('Failed to start 2FA'); }
    finally { setBusy(false); }
  }

  async function verify() {
    setBusy(true);
    try {
      const wallet = localStorage.getItem('last_connected_wallet');
      if (!wallet) return;
      const res = await fetch('/api/2fa?action=verify', { method: 'POST', headers: { 'Content-Type':'application/json', 'x-wallet': wallet }, body: JSON.stringify({ token }) });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error || 'Invalid code'); return; }
      setEnabled(true);
      setRecovery(json.recovery);
      setQr(null);
      setToken('');
      toast.success('2FA enabled');
    } catch { toast.error('Verify failed'); }
    finally { setBusy(false); }
  }

  async function disable() {
    setBusy(true);
    try {
      const wallet = localStorage.getItem('last_connected_wallet');
      if (!wallet) return;
      await fetch('/api/2fa?action=disable', { method: 'POST', headers: { 'x-wallet': wallet } });
      setEnabled(false);
      setQr(null);
      setRecovery(null);
      toast('2FA disabled');
    } catch { toast.error('Disable failed'); }
    finally { setBusy(false); }
  }

  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm" aria-labelledby="twofaHeading">
      <h2 id="twofaHeading" className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Two-Factor Authentication (2FA)</h2>
      <p className="text-sm text-gray-600 dark:text-gray-300">Add an extra layer of security for sensitive actions.</p>

      {enabled === null && <div className="mt-3 text-sm text-gray-500">Loading…</div>}

      {enabled === false && (
        <div className="mt-3">
          {!qr ? (
            <button onClick={start} disabled={busy} className="px-3 py-2 rounded bg-brand-purple text-white font-semibold disabled:opacity-50">Start setup</button>
          ) : (
            <div className="grid gap-2 max-w-sm">
              <Image src={qr} alt="2FA QR" width={256} height={256} className="rounded border border-gray-200 dark:border-gray-700 h-auto w-auto" />
              <label className="text-sm text-gray-600 dark:text-gray-300">Enter 6-digit code</label>
              <input value={token} onChange={e=>setToken(e.target.value)} className="px-3 py-2 rounded bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700" placeholder="123456" />
              <div className="flex gap-2">
                <button onClick={verify} disabled={busy || token.length<6} className="px-3 py-2 rounded bg-brand-purple text-white font-semibold disabled:opacity-50">Verify & enable</button>
                <button onClick={()=>setQr(null)} className="px-3 py-2 rounded bg-gray-200 dark:bg-gray-700">Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}

      {enabled === true && (
        <div className="mt-3">
          <div className="text-sm text-green-600 dark:text-green-400">2FA is enabled</div>
          {recovery && (
            <div className="mt-2 text-xs">
              <div className="mb-1 text-gray-500">Recovery codes (store safely):</div>
              <ul className="grid grid-cols-2 gap-1">
                {recovery.map((c)=> (<li key={c} className="font-mono bg-gray-100 dark:bg-gray-900/50 rounded px-2 py-1 border border-gray-200 dark:border-gray-700">{c}</li>))}
              </ul>
            </div>
          )}
          <button onClick={disable} disabled={busy} className="mt-3 px-3 py-2 rounded bg-gray-200 dark:bg-gray-700">Disable 2FA</button>
        </div>
      )}
    </section>
  );
}

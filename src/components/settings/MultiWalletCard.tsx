"use client";
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useI18n } from '@/lib/i18n';

type Linked = { id?: string; linked_wallet: string; is_primary: boolean };

async function signWithWallet(message: string, provider: any): Promise<string> {
  if (!provider?.signMessage) throw new Error('Wallet provider not found');
  const encoded = new TextEncoder().encode(message);
  const res = await provider.signMessage(encoded, 'utf8');
  const bs58 = (await import('bs58')).default;
  return bs58.encode(res.signature);
}

export default function MultiWalletCard({ wallet }: { wallet?: string | null }) {
  const { t } = useI18n();
  const [list, setList] = useState<Linked[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [showProviders, setShowProviders] = useState(false);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);

  const owner = wallet || null;
  const hasOwner = !!owner;

  const load = useMemo(() => async () => {
    if (!owner) { setList([]); return; }
    try {
      const res = await fetch('/api/wallets', { headers: { 'x-wallet': owner } });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to load wallets');
      const rows = (json.data || []) as Array<any>;
      const mapped: Linked[] = rows.map((r: any) => ({ id: r.id, linked_wallet: r.linked_wallet, is_primary: !!r.is_primary }));
      // Ensure owner is always in list as primary if none from server
      if (!mapped.find(m => m.linked_wallet.toLowerCase() === owner.toLowerCase())) {
        mapped.unshift({ linked_wallet: owner, is_primary: !mapped.some(m => m.is_primary) });
      }
      setList(mapped);
    } catch (e: any) { toast.error(e?.message || 'Failed to load wallets'); }
  }, [owner]);

  useEffect(() => { load(); }, [load]);

  function getProviders() {
    const w = window as any;
    const provs: Array<{ key: string; name: string; provider: any }> = [];
    if (w?.phantom?.solana) provs.push({ key: 'phantom', name: 'Phantom', provider: w.phantom.solana });
    if (w?.solflare) provs.push({ key: 'solflare', name: 'Solflare', provider: w.solflare });
    if (w?.backpack) provs.push({ key: 'backpack', name: 'Backpack', provider: w.backpack });
    if (w?.solana && !provs.find(p=>p.provider===w.solana)) provs.push({ key: 'solana', name: 'Solana Wallet', provider: w.solana });
    return provs;
  }

  async function linkWithProvider(provider: any) {
    if (!owner) { toast.error('Connect your primary wallet first'); return; }
    try {
      setLoading(true);
      const message = `Link wallet to FrenzySwap account ${owner} at ${new Date().toISOString()}`;
      const signature = await signWithWallet(message, provider);
      const linkedWallet = provider?.publicKey?.toString?.();
      if (!linkedWallet) throw new Error('Unable to read provider public key');
      const res = await fetch('/api/wallets', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-wallet': owner },
        body: JSON.stringify({ linked_wallet: linkedWallet, signature, message })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to link wallet');
      toast.success(t('toasts.linked'));
      await load();
    } catch (e: any) { toast.error(e?.message || 'Link failed'); }
    finally { setLoading(false); }
  }

  async function linkWallet() {
    const provs = getProviders();
    if (provs.length <= 1) {
      await linkWithProvider(provs[0]?.provider || (window as any)?.solana || (window as any)?.phantom?.solana);
    } else {
      setShowProviders(true);
    }
  }

  async function setPrimary(w: string) {
    if (!owner) return;
    try {
      setActionId(w);
      const res = await fetch('/api/wallets', { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'x-wallet': owner }, body: JSON.stringify({ linked_wallet: w, make_primary: true }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to set primary');
      toast.success(t('toasts.primaryUpdated'));
      await load();
    } catch (e: any) { toast.error(e?.message || 'Failed to update'); }
    finally { setActionId(null); }
  }

  async function unlink(w: string) {
    if (!owner) return;
    try {
      setActionId(w);
      const res = await fetch('/api/wallets', { method: 'DELETE', headers: { 'Content-Type': 'application/json', 'x-wallet': owner }, body: JSON.stringify({ linked_wallet: w }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to unlink');
      toast.success(t('toasts.unlinked'));
      await load();
    } catch (e: any) { toast.error(e?.message || 'Failed to unlink'); }
    finally { setActionId(null); }
  }

  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700" aria-labelledby="mwHeading">
      <h2 id="mwHeading" className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('wallets.title')}</h2>
      <p className="text-sm text-gray-700 dark:text-gray-300">Link additional wallets and choose a primary.</p>
      <ul className="mt-3 space-y-2 text-sm">
        {list.map(w => (
          <li key={w.linked_wallet} className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700/60 rounded p-3">
            <span className="font-mono text-gray-800 dark:text-gray-200">{w.linked_wallet.slice(0,6)}…{w.linked_wallet.slice(-6)} {w.is_primary && <span className="ml-2 text-xxs uppercase bg-brand-purple text-white rounded px-1.5 py-0.5">{t('wallets.primary')}</span>}</span>
            <div className="flex items-center gap-2">
              <button aria-label={`Set ${w.linked_wallet} as primary`} onClick={() => setPrimary(w.linked_wallet)} disabled={w.is_primary || actionId === w.linked_wallet} className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 disabled:opacity-50">
                {actionId === w.linked_wallet ? '…' : t('wallets.setPrimary')}
              </button>
              <button aria-label={`Unlink ${w.linked_wallet}`} onClick={() => setShowConfirm(w.linked_wallet)} disabled={w.is_primary || actionId === w.linked_wallet} className="px-3 py-1 rounded bg-red-600 text-white disabled:opacity-50">
                {actionId === w.linked_wallet ? '…' : t('wallets.unlink')}
              </button>
            </div>
          </li>
        ))}
        {!list.length && <li className="text-gray-500">No linked wallets yet</li>}
      </ul>
  <div className="mt-2 text-xs text-gray-600 dark:text-gray-500">We’ll ask your other wallet to sign a short message to verify ownership. No funds movement.</div>
  <button aria-label="Add wallet" onClick={linkWallet} disabled={!hasOwner || loading} className="mt-3 px-3 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50">
        {loading ? 'Linking…' : t('wallets.link')}
      </button>

      {showProviders && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 w-[90%] max-w-sm">
            <h3 className="text-gray-900 dark:text-white text-base mb-2">Select wallet provider</h3>
            <ul className="space-y-2">
              {getProviders().map(p => (
                <li key={p.key}>
                  <button onClick={async ()=>{ setShowProviders(false); await linkWithProvider(p.provider); }} className="w-full text-left px-3 py-2 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100">
                    {p.name}
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-3 text-right">
              <button onClick={()=>setShowProviders(false)} className="px-3 py-1.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">{t('common.cancel')}</button>
            </div>
          </div>
        </div>
      )}

      {showConfirm && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 w-[90%] max-w-sm">
            <h3 className="text-gray-900 dark:text-white text-base mb-2">{t('wallets.confirmUnlinkTitle')}</h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm">{t('wallets.confirmUnlinkBody')}</p>
            <div className="mt-3 flex justify-end gap-2">
              <button onClick={()=>setShowConfirm(null)} className="px-3 py-1.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">{t('common.cancel')}</button>
              <button onClick={async()=>{ const w = showConfirm; setShowConfirm(null); await unlink(w!); }} className="px-3 py-1.5 rounded bg-red-600 text-white">{t('common.confirm')}</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

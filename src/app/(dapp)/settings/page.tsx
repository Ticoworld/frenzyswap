"use client";

import { useEffect, useMemo, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import WalletAvatar from '@/components/common/WalletAvatar';
import { supabase } from '@/lib/supabase';
import SessionsCard from '@/components/settings/SessionsCard';
import TwoFactorCard from '@/components/settings/TwoFactorCard';
import ActivityLogCard from '@/components/settings/ActivityLogCard';
import PreferencesCard from '@/components/settings/PreferencesCard';
import PrivacyControlsCard from '@/components/settings/PrivacyControlsCard';
import MultiWalletCard from '@/components/settings/MultiWalletCard';
import OnboardingHelpCard from '@/components/settings/OnboardingHelpCard';
import NotificationsCard from '@/components/settings/NotificationsCard';
import SettingsHelpNav from '@/components/navigation/SettingsHelpNav';
import InviteCard from '@/components/settings/InviteCard';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function SettingsPage() {
  const { publicKey, disconnect } = useWallet();
  const wallet = publicKey?.toString();
  const [isPrivate, setIsPrivate] = useState<boolean>(false);

  // Persist last connected wallet for cross-page settings sync
  useEffect(() => {
    try {
      if (wallet) localStorage.setItem('last_connected_wallet', wallet);
      else localStorage.removeItem('last_connected_wallet');
    } catch {}
  }, [wallet]);

  // Load initial privacy from user_profiles
  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!wallet || !supabase) return;
      const { data } = await supabase.from('user_profiles').select('is_private').eq('wallet_address', wallet).maybeSingle();
      if (mounted && data) setIsPrivate(!!data.is_private);
    }
    load();
    return () => { mounted = false };
  }, [wallet]);

  async function togglePrivacy(next: boolean) {
    if (!wallet) {
      toast.error('Wallet not found. Please reconnect.');
      return;
    }
    const prev = isPrivate; setIsPrivate(next);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-wallet': wallet },
        body: JSON.stringify({ is_private: next })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || 'Unable to update privacy. Try again.');
      toast.success(next ? 'Profile is now private' : 'Profile is now public');
    } catch (e: any) {
      setIsPrivate(prev);
      toast.error(e?.message || 'Unable to update privacy. Try again.');
    }
  }

  const { data: referrals } = useSWR(wallet ? `/api/referrals?wallet=${wallet}&role=referrer` : null, fetcher);
  const referralCount = (referrals?.data || []).length;
  const verifiedCount = (referrals?.data || []).filter((r: any) => r.status === 'verified').length;

  const referralLink = useMemo(() => (wallet ? `${location.origin}/?ref=${wallet}` : ''), [wallet]);

  async function handleDisconnect() {
    try {
      await disconnect();
    } catch {}
    try {
      // Clean common session keys (Supabase, app caches)
      Object.keys(localStorage).forEach(k => { if (k.startsWith('sb-') || k.startsWith('frenzy') || k.includes('supabase')) localStorage.removeItem(k); });
    } catch {}
    toast.success('Disconnected');
    // Redirect by reloading to clear in-memory context
    location.href = '/';
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SettingsHelpNav />
      <div className="max-w-4xl mx-auto px-4 pt-16 md:pt-14 pb-8 space-y-6">
        <motion.h1 initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="text-3xl font-bold text-gray-900 dark:text-white">Settings</motion.h1>

        {!wallet && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">Connect your wallet to manage account settings. Preferences are always available below.</div>
        )}
        {wallet && (
          <>
            {/* Wallet card */}
            <section className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <WalletAvatar wallet={wallet} size={40} />
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Wallet</div>
                    <div className="font-mono text-gray-900 dark:text-white">{wallet.slice(0,6)}…{wallet.slice(-6)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { navigator.clipboard.writeText(wallet); toast.success('Copied wallet'); }}
                    className="px-3 py-1.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-100 border border-gray-300 dark:border-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
                    aria-label="Copy wallet address"
                  >Copy</button>
                  <button
                    onClick={handleDisconnect}
                    className="px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-500 text-sm"
                    aria-label="Disconnect wallet"
                  >Disconnect</button>
                </div>
              </div>
            </section>

            {/* Privacy */}
            <section className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Privacy</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Hide your profile from public leaderboards and analytics.</p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-700 dark:text-gray-300" htmlFor="privacyToggle">Private</label>
                  <input id="privacyToggle" type="checkbox" checked={isPrivate} onChange={(e)=>togglePrivacy(e.target.checked)} disabled={!wallet}
                    className="h-5 w-9 appearance-none rounded-full bg-gray-200 dark:bg-gray-700 checked:bg-yellow-500 dark:checked:bg-yellow-600 border border-gray-300 dark:border-gray-700 relative cursor-pointer outline-none disabled:opacity-50 disabled:cursor-not-allowed before:content-[''] before:absolute before:h-4 before:w-4 before:top-0.5 before:left-0.5 before:bg-white dark:before:bg-gray-400 before:rounded-full before:transition-transform checked:before:translate-x-4" aria-describedby="privacyHelp" />
                </div>
              </div>
              <div id="privacyHelp" className="text-xs text-gray-600 dark:text-gray-500 mt-2">Takes effect immediately. You can undo anytime.</div>
            </section>

            {/* Referral */}
            <section className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Referral</h2>
              <div className="text-sm text-gray-700 dark:text-gray-300">Share your link to invite friends and earn points.</div>
              <div className="mt-3 flex flex-col md:flex-row gap-3">
                <input readOnly value={referralLink} className="flex-1 px-3 py-2 rounded bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200" aria-label="Referral link" />
                <button onClick={() => { navigator.clipboard.writeText(referralLink); toast.success('Referral link copied'); }} className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white">Copy Link</button>
              </div>
              <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">Stats: {verifiedCount} verified / {referralCount} total</div>
            </section>

            {/* Invite Friends */}
            <InviteCard wallet={wallet} />

            {/* Security & Sessions */}
            <TwoFactorCard />
            <SessionsCard wallet={wallet} />

            {/* Activity Log */}
            <ActivityLogCard wallet={wallet} />

            <PreferencesCard />

            {/* Multi-wallet */}
            <MultiWalletCard wallet={wallet} />

            {/* Granular Privacy */}
            <PrivacyControlsCard wallet={wallet} />

            <NotificationsCard />
            <OnboardingHelpCard />

            {/* Onboarding & Help */}
          </>
        )}

            {/* Support */}
            <section className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Support</h2>
              <div className="text-sm text-gray-700 dark:text-gray-300">Need help? See <a href="/legal/privacy" className="underline">Privacy</a> and <a href="/legal/terms" className="underline">Terms</a>, or reach us on Telegram/X.</div>
            </section>
          
      </div>
    </div>
  );
}

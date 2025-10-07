"use client";

import { Fragment, useState } from 'react';
import { Menu, Switch, Transition } from '@headlessui/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDownIcon, UserIcon, ShieldIcon, SettingsIcon, LogOutIcon, EyeOffIcon, EyeIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useWallet } from '@solana/wallet-adapter-react';

function classNames(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function UserMenu({ initialPrivate = false }: { initialPrivate?: boolean }) {
  const [isPrivate, setIsPrivate] = useState(initialPrivate);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const router = useRouter();
  const { publicKey, disconnect } = useWallet();
  const wallet = publicKey?.toString();

  async function togglePrivacy(next: boolean) {
    if (!wallet) {
      toast.error('Wallet not found. Please reconnect.');
      return;
    }
    setIsPrivate(next);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-wallet': wallet },
        body: JSON.stringify({ is_private: next }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || 'Unable to update privacy. Try again.');
      toast.success(next ? 'Profile set to private' : 'Profile set to public');
      router.refresh();
    } catch (e: any) {
      setIsPrivate(!next);
      toast.error(e?.message || 'Unable to update privacy. Try again.');
    }
  }

  async function doDisconnect() {
    try { await disconnect(); } catch {}
    try { Object.keys(localStorage).forEach(k => { if (k.startsWith('sb-') || k.includes('supabase')) localStorage.removeItem(k); }); } catch {}
    setConfirmOpen(false);
    toast.success('Disconnected');
    router.push('/');
  }

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple">
        <UserIcon className="h-4 w-4" />
        Account
        <ChevronDownIcon className="ml-1 h-4 w-4" aria-hidden="true" />
      </Menu.Button>

      <Transition as={Fragment}
        enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
        <Menu.Items className="absolute right-0 z-50 mt-2 w-72 origin-top-right rounded-md bg-black/80 backdrop-blur-xl border-2 border-brand-purple/20 shadow-lg focus:outline-none">
          <div className="p-3 border-b border-gray-800 text-xs text-gray-400">Wallet & profile</div>
          <div className="py-2">
            <Menu.Item>
              {({ active }) => (
                <Link href="/profile" className={classNames(active ? 'bg-brand-purple/10 text-white' : 'text-gray-300', 'flex items-center gap-3 px-4 py-3 text-sm')}>
                  <UserIcon className="h-4 w-4 text-brand-purple" />
                  Profile
                </Link>
              )}
            </Menu.Item>

            <div className="px-4 py-3 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-300">
                {isPrivate ? <EyeOffIcon className="h-4 w-4 text-brand-purple" /> : <EyeIcon className="h-4 w-4 text-brand-purple" />}
                Privacy
              </div>
              <Switch
                checked={isPrivate}
                onChange={togglePrivacy}
                className={classNames(
                  isPrivate ? 'bg-brand-purple' : 'bg-gray-700',
                  'relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple'
                )}
              >
                <span
                  aria-hidden="true"
                  className={classNames(
                    isPrivate ? 'translate-x-5' : 'translate-x-0',
                    'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200'
                  )}
                />
              </Switch>
            </div>

            <Menu.Item>
              {({ active }) => (
                <Link href="/referrals" className={classNames(active ? 'bg-brand-purple/10 text-white' : 'text-gray-300', 'flex items-center gap-3 px-4 py-3 text-sm')}>
                  <ShieldIcon className="h-4 w-4 text-brand-purple" />
                  Referrals
                </Link>
              )}
            </Menu.Item>

            <Menu.Item>
              {({ active }) => (
                <Link href="/settings" className={classNames(active ? 'bg-brand-purple/10 text-white' : 'text-gray-300', 'flex items-center gap-3 px-4 py-3 text-sm')}>
                  <SettingsIcon className="h-4 w-4 text-brand-purple" />
                  Settings
                </Link>
              )}
            </Menu.Item>
          </div>
          <div className="border-t border-gray-800 p-2">
            <button onClick={() => setConfirmOpen(true)} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-brand-purple/10 rounded-md">
              <LogOutIcon className="h-4 w-4 text-brand-purple" /> Disconnect
            </button>
          </div>
        </Menu.Items>
      </Transition>

      {confirmOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50">
          <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-xl w-[90vw] max-w-sm p-5">
            <h3 className="text-white font-semibold mb-2">Disconnect wallet?</h3>
            <p className="text-sm text-gray-400">Wallet: <span className="font-mono">{wallet?.slice(0,6)}…{wallet?.slice(-6)}</span></p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button onClick={() => setConfirmOpen(false)} className="px-3 py-2 rounded bg-gray-700 text-gray-100 hover:bg-gray-600 text-sm">Cancel</button>
              <button onClick={doDisconnect} className="px-3 py-2 rounded bg-red-600 text-white hover:bg-red-500 text-sm">Disconnect</button>
            </div>
          </div>
        </div>
      )}
    </Menu>
  );
}

"use client";
import { useState } from 'react';
import toast from 'react-hot-toast';
import SettingsHelpNav from '@/components/navigation/SettingsHelpNav';

export default function SupportPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: post to /api/support or external helpdesk
    toast.success('Thanks! We will get back to you.');
    setEmail(''); setMessage('');
  };

  return (
    <main className="min-h-screen bg-white text-neutral-900 dark:bg-gray-900 dark:text-gray-200">
      <div className="min-h-screen">
        <SettingsHelpNav />
        <div className="max-w-3xl mx-auto px-4 pt-16 md:pt-14 pb-10 space-y-6">
        <h1 className="text-3xl font-bold">Support</h1>
        <form onSubmit={submit} className="space-y-3 bg-neutral-100 border border-neutral-200 rounded p-4 dark:bg-gray-800 dark:border-gray-700" aria-describedby="supportHelp">
          <label className="block text-sm">
            <span className="text-neutral-700 dark:text-gray-300">Email</span>
            <input value={email} onChange={e=>setEmail(e.target.value)} required type="email" className="mt-1 w-full px-3 py-2 rounded bg-white border border-neutral-300 text-neutral-900 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200" />
          </label>
          <label className="block text-sm">
            <span className="text-neutral-700 dark:text-gray-300">Message</span>
            <textarea value={message} onChange={e=>setMessage(e.target.value)} required rows={5} className="mt-1 w-full px-3 py-2 rounded bg-white border border-neutral-300 text-neutral-900 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200" />
          </label>
          <button type="submit" className="px-4 py-2 rounded bg-yellow-600 hover:bg-yellow-500 text-black" aria-label="Send message">Send</button>
        </form>
        <div id="supportHelp" className="bg-neutral-100 border border-neutral-200 rounded p-4 text-sm dark:bg-gray-800 dark:border-gray-700">
          <div>Telegram: <a href="https://t.me/" target="_blank" className="underline">Join chat</a></div>
          <div>X (Twitter): <a href="https://x.com/" target="_blank" className="underline">Follow us</a></div>
        </div>
        </div>
      </div>
    </main>
  );
}

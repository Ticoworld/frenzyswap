import SettingsHelpNav from '@/components/navigation/SettingsHelpNav';
export default function FAQPage() {
  const faqs = [
    { q: 'How does privacy work?', a: 'You can set your profile to private and control visibility of specific stats in Settings.' },
    { q: 'Is my wallet secure?', a: 'We never store your private keys. Use reputable wallets and enable device security. 2FA for sensitive actions is planned.' },
    { q: 'How do referrals work?', a: 'Share your link from Settings. When your friend joins and completes actions, you earn points.' },
    { q: 'How are points calculated?', a: 'Points accrue from eligible actions (swaps, streaks, referrals). See Rewards for details.' },
    { q: 'Troubleshooting?', a: 'Try refreshing, reconnecting your wallet, or clearing site data. Contact Support if issues persist.' },
  ];
  return (
    <main className="min-h-screen bg-white text-neutral-900 dark:bg-gray-900 dark:text-gray-200">
      <SettingsHelpNav />
      <div className="max-w-3xl mx-auto px-4 pt-16 md:pt-14 pb-10 space-y-6">
        <h1 className="text-3xl font-bold">FAQ</h1>
        <ul className="space-y-4">
          {faqs.map((f, i) => (
            <li key={i} className="bg-neutral-100 border border-neutral-200 rounded p-4 dark:bg-gray-800 dark:border-gray-700">
              <h2 className="font-semibold text-neutral-900 dark:text-white">{f.q}</h2>
              <p className="text-sm text-neutral-700 mt-1 dark:text-gray-300">{f.a}</p>
            </li>
          ))}
        </ul>
        <div className="text-xs text-gray-400">More: <a className="text-yellow-500 hover:underline" href="/help/quick-start">Quick Start</a> · <a className="text-yellow-500 hover:underline" href="/help/support">Support</a> · <a className="text-yellow-500 hover:underline" href="/settings">Settings</a></div>
      </div>
    </main>
  );
}

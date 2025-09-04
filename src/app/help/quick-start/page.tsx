import SettingsHelpNav from '@/components/navigation/SettingsHelpNav';
export default function QuickStartPage() {
  return (
  <main className="min-h-screen bg-white text-neutral-900 dark:bg-gray-900 dark:text-gray-200">
      <SettingsHelpNav />
      <div className="max-w-3xl mx-auto px-4 pt-16 md:pt-14 pb-10 space-y-6">
        <h1 className="text-3xl font-bold">Quick start</h1>
        <ol className="list-decimal pl-6 space-y-4 text-sm md:text-base">
          <li>Connect your wallet (Phantom, Solflare, etc.).</li>
          <li>Swap tokens on the Swap page; confirm in wallet.</li>
          <li>Earn points and streaks automatically with activity.</li>
          <li>Track P&L, volume, and badges on your Profile.</li>
          <li>Invite friends using your referral link to earn bonuses.</li>
          <li>Manage privacy and preferences in <a className="text-yellow-500 hover:underline" href="/settings">Settings</a>.</li>
        </ol>
        <div className="text-xs text-gray-400">Need help? Visit the <a className="text-yellow-500 hover:underline" href="/help/faq">FAQ</a> or <a className="text-yellow-500 hover:underline" href="/help/support">Support</a> pages.</div>
      </div>
    </main>
  );
}

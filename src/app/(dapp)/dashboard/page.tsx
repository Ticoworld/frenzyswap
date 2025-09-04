import Link from 'next/link';
import DashboardAnalytics from '@/components/common/DashboardAnalytics';
export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  // TODO: fetch real stats from backend once available
  const progress = 0.35;
  return (
    <main className="min-h-screen px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
      <section className="grid gap-4 md:grid-cols-2">
        <DashboardAnalytics />
        <div className="bg-gray-800 text-gray-100 dark:bg-gray-800 border border-gray-700 rounded p-4">
          <h2 className="font-medium mb-2">Progress</h2>
          <div className="h-2 bg-gray-700 rounded">
            <div className="h-2 bg-yellow-500 rounded" style={{ width: `${Math.round(progress*100)}%` }} />
          </div>
          <div className="text-xs text-gray-400 mt-1">Next badge: Bronze Trader</div>
        </div>
        <div className="bg-gray-800 text-gray-100 dark:bg-gray-800 border border-gray-700 rounded p-4">
          <h2 className="font-medium mb-2">Leaderboard</h2>
          <div className="text-sm text-gray-300">Coming soon</div>
        </div>
        <div className="bg-gray-800 text-gray-100 dark:bg-gray-800 border border-gray-700 rounded p-4">
          <h2 className="font-medium mb-2">Referrals</h2>
          <div className="text-sm text-gray-300">Invites: 0 · Verified: 0</div>
        </div>
        <div className="bg-gray-800 text-gray-100 dark:bg-gray-800 border border-gray-700 rounded p-4">
          <h2 className="font-medium mb-2">Recent activity</h2>
          <ul className="text-sm text-gray-300 list-disc pl-5">
            <li>Swap preview — demo</li>
            <li>Badge earned — demo</li>
          </ul>
        </div>
      </section>
      <div className="mt-4 text-sm">
        <Link href="/settings" className="underline text-yellow-500">Go to Settings</Link>
      </div>
    </main>
  );
}

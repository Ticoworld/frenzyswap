// src/config/nav.ts
// Centralized navigation config for scalability

export type NavItem = {
  label: string;
  href: string;
  icon?: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
  description?: string;
  badge?: string;
};

export const rewardsNav: NavItem[] = [
  { label: 'Leaderboards', href: '/leaderboard', description: 'Top traders, points and streaks' },
  { label: 'Badges', href: '/profile#badges', description: 'Collect badges for your milestones' },
  { label: 'Referrals', href: '/referrals', description: 'Invite friends and earn' },
];

export const analyticsNav: NavItem[] = [
  { label: 'Swaps', href: '/swaps', description: 'Your swap history' },
  { label: 'P&L', href: '/profile#pnl', description: 'Your realized performance' },
  { label: 'Wallet Stats', href: '/profile', description: 'Overview of points, streaks and more' },
];

export const moreNav: NavItem[] = [
  { label: 'NFTs', href: '/nfts' },
  { label: 'Staking', href: '/staking', badge: 'soon' },
  { label: 'DAO', href: '/dao' },
];

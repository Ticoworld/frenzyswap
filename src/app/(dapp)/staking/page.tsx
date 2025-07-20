import { ComingSoon } from '@/components/common/ComingSoon';

export default function StakingPage() {
  return (
    <ComingSoon 
      title="Staking Dashboard"
      description="Earn rewards by staking your FRENZY tokens"
      icon={
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
          <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
        </svg>
      }
    />
  );
}
import { ComingSoon } from '@/components/common/ComingSoon';

export default function DAOPage() {
  return (
    <ComingSoon 
      title="DAO Governance"
      description="Shape the future of MemeFrenzy ecosystem"
      icon={
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      }
    />
  );
}
import { ComingSoon } from '@/components/common/ComingSoon';

export default function NFTsPage() {
  return (
    <ComingSoon 
      title="NFT Marketplace"
      description="Trade exclusive MemeFrenzy NFTs coming soon"
      icon={
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
      }
    />
  );
}
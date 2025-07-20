import { LegalPage } from '@/components/common/LegalPage';

export default function PrivacyPage() {
  return (
    <LegalPage 
      title="Privacy Policy"
      lastUpdated="July 7, 2025"
    >
      <div className="prose prose-invert max-w-3xl">
        <h2>1. Information Collection</h2>
        <p>We do not collect any personal information. FrenzySwap is a non-custodial, decentralized exchange...</p>
        
        <h2>2. Blockchain Transparency</h2>
        <p>All transactions are public and recorded on the Solana blockchain...</p>
      </div>
    </LegalPage>
  );
}
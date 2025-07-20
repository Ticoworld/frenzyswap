import { LegalPage } from '@/components/common/LegalPage';

export default function TermsPage() {
  return (
    <LegalPage 
      title="Terms of Service"
      lastUpdated="July 7, 2025"
    >
      <div className="prose prose-invert max-w-3xl">
        <h2>1. Introduction</h2>
        <p>Welcome to FrenzySwap (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;). These Terms of Service govern your use of our decentralized exchange platform.</p>
        
        <h2>2. Acceptance of Terms</h2>
        <p>By accessing or using FrenzySwap, you agree to comply with these terms...</p>
        
        {/* Add more sections as needed */}
        
        <div className="mt-8 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-yellow-500">Disclaimer</h3>
          <p>FrenzySwap is a decentralized protocol. You are solely responsible for your use of the platform and any transactions you conduct.</p>
        </div>
      </div>
    </LegalPage>
  );
}
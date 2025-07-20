import { LegalPage } from '@/components/common/LegalPage';

export default function DisclaimerPage() {
  return (
    <LegalPage 
      title="Disclaimer"
      lastUpdated="July 7, 2025"
    >
      <div className="prose prose-invert max-w-3xl">
        <h2>1. No Financial Advice</h2>
        <p>FrenzySwap is a decentralized exchange platform. All content, features, and tools provided through the platform are for informational purposes only and do not constitute financial, investment, or trading advice.</p>

        <h2>2. User Responsibility</h2>
        <p>By using FrenzySwap, you acknowledge that you are solely responsible for your own decisions and assume all risks associated with cryptocurrency transactions, including but not limited to potential loss of funds or assets.</p>

        <h2>3. No Guarantees</h2>
        <p>We make no representations or warranties regarding the accuracy, completeness, or reliability of any information available through the platform. Use of FrenzySwap is at your own risk.</p>

        <h2>4. Regulatory Compliance</h2>
        <p>You are responsible for ensuring that your use of FrenzySwap complies with applicable laws and regulations in your jurisdiction, including tax and regulatory obligations related to crypto assets.</p>

        <h2>5. Third-Party Services</h2>
        <p>FrenzySwap may integrate third-party protocols or services (e.g., Jupiter Aggregator). We are not responsible for the actions, availability, or security of these external platforms.</p>

        <div className="mt-8 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-yellow-500">Risk Notice</h3>
          <p>Cryptocurrency trading involves significant risk. You may lose some or all of your investment. Always conduct your own research before participating in any crypto activity.</p>
        </div>
      </div>
    </LegalPage>
  );
}

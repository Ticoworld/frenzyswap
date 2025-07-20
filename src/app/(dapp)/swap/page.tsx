import SwapForm from '@/components/swap/SwapForm';

export default function SwapPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Swap Tokens</h1>
        <SwapForm />
      </div>
    </div>
  );
}

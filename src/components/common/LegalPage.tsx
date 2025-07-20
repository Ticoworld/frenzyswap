import Link from 'next/link';

interface LegalPageProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export function LegalPage({ title, lastUpdated, children }: LegalPageProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{title}</h1>
        <p className="text-gray-500">Last updated: {lastUpdated}</p>
      </div>
      
      <div className="mb-12">
        {children}
      </div>
      
      <div className="mt-16 pt-8 border-t border-gray-800">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-yellow-500 mb-4 md:mb-0">
            FrenzySwap
          </Link>
          
          <div className="flex space-x-6">
            <Link href="/legal/terms" className="text-gray-400 hover:text-white">
              Terms
            </Link>
            <Link href="/legal/privacy" className="text-gray-400 hover:text-white">
              Privacy
            </Link>
            <Link href="/legal/disclaimer" className="text-gray-400 hover:text-white">
              Disclaimer
            </Link>
          </div>
        </div>
      </div> 
    </div>
  );
}
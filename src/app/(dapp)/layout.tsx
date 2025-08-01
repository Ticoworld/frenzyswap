import { WalletProvider } from '@/lib/wallet/adapter';
import { DappHeader } from '@/components/layout/DappHeader';
import { DappFooter } from '@/components/layout/DappFooter';
import { AnalyticsProvider } from '@/components/common/AnalyticsProvider';

export default function DAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WalletProvider>
      <AnalyticsProvider />
      <div className="min-h-screen flex flex-col">
        <DappHeader />
        <main className="flex-grow">{children}</main>
        <DappFooter />
      </div>
    </WalletProvider>
  );
}
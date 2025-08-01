import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { AnalyticsProvider } from '@/components/common/AnalyticsProvider';

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <AnalyticsProvider />
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
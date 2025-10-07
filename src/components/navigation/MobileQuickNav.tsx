"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n';

export default function MobileQuickNav() {
  const pathname = usePathname();
  const { t } = useI18n();
  const hideOn = ['/swap']; // pages where bottom nav might conflict
  if (hideOn.includes(pathname)) return null;
  return (
    <div className="md:hidden fixed bottom-3 left-0 right-0 z-[90]">
      <div className="mx-auto w-[min(96%,480px)] flex items-center justify-between gap-2 rounded-xl bg-gray-800/95 border border-gray-700 shadow-lg px-3 py-2" role="navigation" aria-label="Quick navigation">
        <Link href="/help/quick-start" className="flex-1 text-center py-2 rounded text-gray-200 bg-gray-700/50 hover:bg-gray-700">{t('nav.quickStart')}</Link>
        <Link href="/settings" className="flex-1 text-center py-2 rounded text-white bg-brand-purple hover:bg-brand-purple/90">{t('nav.settings')}</Link>
      </div>
    </div>
  );
}

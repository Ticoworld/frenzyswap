"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';

const links = [
  { href: '/settings', key: 'nav.settings' },
  { href: '/help/quick-start', key: 'nav.quickStart' },
  { href: '/help/faq', key: 'nav.faq' },
  { href: '/help/support', key: 'nav.support' },
  { href: '/profile', key: 'nav.profile' },
  { href: '/referrals', key: 'nav.referrals' }
];

export default function SettingsHelpNav({ showBack = true }: { showBack?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();
  return (
    <nav aria-label="Secondary" className="sticky top-[56px] z-30 bg-gray-900/90 backdrop-blur border-b border-gray-800">
      <div className="mx-auto max-w-6xl px-3 sm:px-4 py-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {showBack && (
            <button onClick={() => router.back()} className="px-2 py-1 text-xs rounded border border-gray-700 text-gray-300 hover:bg-gray-800" aria-label={t('nav.back')}>← {t('nav.back')}</button>
          )}
          {links.map(l => (
            <Link key={l.href} href={l.href} className={pathname === l.href ? 'px-2.5 py-1 text-xs rounded bg-yellow-600 text-black whitespace-nowrap' : 'px-2.5 py-1 text-xs rounded text-gray-300 hover:bg-gray-800 whitespace-nowrap'}>
              {t(l.key)}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export default function SectionTabs({
  basePath,
  tabs,
}: {
  basePath: string;
  tabs: { label: string; href: string }[];
}) {
  const pathname = usePathname();
  return (
    <div className="border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex gap-2">
          {tabs.map((t) => {
            const active = pathname === t.href || pathname.startsWith(t.href + '/');
            return (
              <Link key={t.href} href={t.href} className={active ? 'relative px-3 py-2 text-yellow-500' : 'relative px-3 py-2 text-gray-400 hover:text-white'}>
                {t.label}
                {active && (
                  <motion.span layoutId="section-tabs-underline" className="absolute left-0 right-0 -bottom-px h-0.5 bg-yellow-500" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

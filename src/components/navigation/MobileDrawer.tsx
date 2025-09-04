"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { rewardsNav, analyticsNav, moreNav } from '@/config/nav';
import { motion, AnimatePresence } from 'framer-motion';

export default function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const asideRef = useRef<HTMLElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  // Mount-only flag for portal usage
  useEffect(() => setIsClient(true), []);

  // Lock body scroll when open
  useEffect(() => {
    if (!isClient) return;
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      // Reset scroll to top so nav items are visible, not the CTA
      requestAnimationFrame(() => {
        if (contentRef.current) contentRef.current.scrollTop = 0;
        firstLinkRef.current?.focus();
      });
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open, isClient]);

  // Handle ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !isClient) return null;

  // Basic focus trap handler
  const onTrapFocus = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !asideRef.current) return;
    const focusable = asideRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const drawer = (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <motion.aside
        key="drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'tween', duration: 0.2 }}
        className="fixed right-0 top-0 bottom-0 z-[101] w-80 max-w-[85vw] bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-2xl"
        ref={asideRef}
        onKeyDown={onTrapFocus}
      >
        <div className="flex items-center justify-between px-4 h-14 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">Navigation</h3>
          <button onClick={onClose} aria-label="Close menu" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-1">✕</button>
        </div>
        <div ref={contentRef} className="h-[calc(100%-56px)] overflow-y-auto px-2 py-3 pb-24">
          <section className="mb-4">
            <h4 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-500 mb-2 px-2">Primary</h4>
            <Link
              ref={firstLinkRef}
              href="/swap"
              onClick={onClose}
              className={pathname === '/swap' ? 'block px-3 py-2 rounded bg-gray-100 dark:bg-gray-800 text-yellow-600 dark:text-yellow-500' : 'block px-3 py-2 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}
            >
              Swap
            </Link>
          </section>

          <section className="mb-4">
            <h4 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-500 mb-2 px-2">Rewards</h4>
            {rewardsNav.map((i) => (
              <Link
                key={i.href}
                href={i.href}
                onClick={onClose}
                className={pathname === i.href ? 'block px-3 py-2 rounded bg-gray-100 dark:bg-gray-800 text-yellow-600 dark:text-yellow-500' : 'block px-3 py-2 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}
              >
                {i.label}
              </Link>
            ))}
          </section>

          <section className="mb-4">
            <h4 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-500 mb-2 px-2">Analytics</h4>
            {analyticsNav.map((i) => (
              <Link
                key={i.href}
                href={i.href}
                onClick={onClose}
                className={pathname === i.href ? 'block px-3 py-2 rounded bg-gray-100 dark:bg-gray-800 text-yellow-600 dark:text-yellow-500' : 'block px-3 py-2 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}
              >
                {i.label}
              </Link>
            ))}
          </section>

          <section className="mb-4">
            <h4 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-500 mb-2 px-2">More</h4>
            {moreNav.map((i) => (
              <Link
                key={i.href}
                href={i.href}
                onClick={onClose}
                className={pathname === i.href ? 'block px-3 py-2 rounded bg-gray-100 dark:bg-gray-800 text-yellow-600 dark:text-yellow-500' : 'block px-3 py-2 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}
              >
                {i.label}
                {i.badge && (
                  <span className="ml-2 text-xxs uppercase bg-yellow-600 text-black rounded px-1.5 py-0.5">
                    {i.badge}
                  </span>
                )}
              </Link>
            ))}
          </section>

          <section className="mb-4">
            <h4 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-500 mb-2 px-2">Account</h4>
            <Link
              href="/settings"
              onClick={onClose}
              className={pathname === '/settings' ? 'block px-3 py-2 rounded bg-gray-100 dark:bg-gray-800 text-yellow-600 dark:text-yellow-500' : 'block px-3 py-2 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}
            >
              Settings
            </Link>
            <Link
              href="/profile"
              onClick={onClose}
              className={pathname === '/profile' ? 'block px-3 py-2 rounded bg-gray-100 dark:bg-gray-800 text-yellow-600 dark:text-yellow-500' : 'block px-3 py-2 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}
            >
              Profile
            </Link>
            <Link
              href="/referrals"
              onClick={onClose}
              className={pathname === '/referrals' ? 'block px-3 py-2 rounded bg-gray-100 dark:bg-gray-800 text-yellow-600 dark:text-yellow-500' : 'block px-3 py-2 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}
            >
              Referrals
            </Link>
          </section>
        </div>

        {/* Pinned CTA distinct from navigation */}
        <div className="absolute left-0 right-0 bottom-0 p-3 border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur">
          <Link
            href="/swap"
            onClick={onClose}
            className="block text-center bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-medium py-2 rounded-lg shadow"
          >
            Start Swapping
          </Link>
        </div>
      </motion.aside>
    </AnimatePresence>
  );

  // Render above any header stacking context to avoid clipping/overlap
  return createPortal(drawer, document.body);
}

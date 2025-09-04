"use client";
import { useState, useRef, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';

export default function OnboardingHelpCard() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) setOpen(false);
      if (!open) return;
      if (e.key === 'Tab') {
        // very light focus trap
        const dlg = document.getElementById('tourDialog');
        if (!dlg) return;
        const focusables = dlg.querySelectorAll<HTMLElement>('a,button,[tabindex]:not([tabindex="-1"])');
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey) {
          if (active === first) { e.preventDefault(); last.focus(); }
        } else {
          if (active === last) { e.preventDefault(); first.focus(); }
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => { if (open) closeBtnRef.current?.focus(); }, [open]);

  const steps = [
    { title: 'Welcome to FrenzySwap', body: 'Link wallets, manage privacy, and explore analytics securely.' },
    { title: 'Settings & Privacy', body: 'Control theme, language, and what data is visible to others.' },
    { title: 'Multi-Wallet', body: 'Link multiple wallets and choose a primary with one tap.' },
  ];

  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700" aria-labelledby="obHeading">
      <h2 id="obHeading" className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Onboarding & Help</h2>
      <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc pl-5 space-y-1">
        <li><a href="/help/quick-start" className="underline">Quick start</a> — Learn how to swap, earn, and track.</li>
        <li><a href="/help/faq" className="underline">FAQ</a> — Common questions answered.</li>
        <li><a href="/help/support" className="underline">Support</a> — Contact form and chat links.</li>
      </ul>
      <div className="mt-3">
        <button onClick={()=>{ setStep(0); setOpen(true); }} className="px-3 py-2 rounded bg-yellow-600 text-black hover:bg-yellow-500">Start Tour</button>
      </div>
      <div className="mt-2 text-xs text-gray-500">Interactive guide is a lightweight modal here; can be replaced with a full tour library later.</div>

      {open && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div id="tourDialog" className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 w-[min(92%,520px)]">
            <div className="flex items-start justify-between">
              <h3 className="text-gray-900 dark:text-white text-base">{steps[step].title}</h3>
              <button ref={closeBtnRef} onClick={()=>setOpen(false)} aria-label="Close" className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white">✕</button>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-sm mt-2">{steps[step].body}</p>
            <div className="mt-4 flex justify-between">
              <button onClick={()=> setStep(s => Math.max(0, s-1))} disabled={step===0} className="px-3 py-1.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 disabled:opacity-50">Prev</button>
              <div className="space-x-2">
                {step < steps.length-1 ? (
                  <button onClick={()=> setStep(s => Math.min(steps.length-1, s+1))} className="px-3 py-1.5 rounded bg-yellow-500 dark:bg-yellow-600 text-black">Next</button>
                ) : (
                  <button onClick={()=> setOpen(false)} className="px-3 py-1.5 rounded bg-yellow-500 dark:bg-yellow-600 text-black">Done</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

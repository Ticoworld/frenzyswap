'use client';
import { WalletProvider } from '@/lib/wallet/adapter';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast'; // ✅ Import toast system
import { I18nProvider } from '@/lib/i18n';

export default function Providers({ children }: { children: React.ReactNode }) {

  useEffect(() => {
    // Theme bootstrap: apply dark/light/system at startup
    try {
      const applyTheme = (mode: string) => {
        const root = document.documentElement;
        if (mode === 'dark') root.classList.add('dark');
        else if (mode === 'light') root.classList.remove('dark');
        else {
          const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
          root.classList.toggle('dark', !!prefersDark);
        }
      };
      const saved = localStorage.getItem('frenzy_pref_theme') || 'system';
      applyTheme(saved);
      // respond to system changes when in system mode
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => {
        const mode = localStorage.getItem('frenzy_pref_theme') || 'system';
        if (mode === 'system') applyTheme('system');
      };
      mql.addEventListener?.('change', listener);
      return () => mql.removeEventListener?.('change', listener);
    } catch {}
  }, []);

  useEffect(() => {
    const preloadAssets = [
      '/assets/tokens/sol.png',
      '/assets/tokens/meme.png',
      '/assets/logos/frenzyswap_logomark.svg'
    ];
    preloadAssets.forEach(src => {
      const img = new Image();
      img.src = src;
      img.onerror = () => {
        console.warn(`Failed to preload: ${src}`);
      };
    });

    if (typeof window !== 'undefined' && 'fonts' in document) {
      const font = new FontFace(
        'Inter',
        'url(https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2)'
      );
      font.load()
        .then(() => document.fonts.add(font))
        .catch(e => console.warn('Font loading failed:', e));
    }
  }, []);

  return (
    <WalletProvider>
      <I18nProvider>
        {children}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 5000,
            style: {
              background: '#1a1a1a',
              color: '#fff',
              border: '1px solid #8b5cf6', // brand-purple
              padding: '12px 16px',
              fontSize: '0.875rem',
              fontWeight: '500'
            },
            success: {
              style: {
                background: '#1a1a1a',
                color: '#fff',
                border: '1px solid #10b981', // green-500
              },
              iconTheme: {
                primary: '#10b981',
                secondary: '#1a1a1a'
              }
            },
            error: {
              style: {
                background: '#1a1a1a',
                color: '#fff',
                border: '1px solid #ef4444', // red-500
              },
              iconTheme: {
                primary: '#ef4444',
                secondary: '#1a1a1a'
              }
            },
            iconTheme: {
              primary: '#8b5cf6', // brand-purple
              secondary: '#1a1a1a'
            }
          }}
        />
      </I18nProvider>
    </WalletProvider>
  );
}

'use client';
import { WalletProvider } from '@/lib/wallet/adapter';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast'; // ✅ Import toast system

export default function Providers({ children }: { children: React.ReactNode }) {

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
      {children}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid #facc15', // Tailwind yellow-400
            padding: '12px 16px',
            fontSize: '0.875rem',
            fontWeight: '500'
          },
          iconTheme: {
            primary: '#facc15',
            secondary: '#1a1a1a'
          }
        }}
      />
    </WalletProvider>
  );
}

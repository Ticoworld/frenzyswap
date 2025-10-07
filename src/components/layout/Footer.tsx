export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-black border-t border-gray-800 py-12 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/landing/revolution2.png"
          alt=""
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/60"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center mb-4">
              {/* Large screen logo */}
              <img
                src="/assets/logos/Frenzyswap.svg"
                alt="FrenzySwap Logo"
                className="h-10 w-auto hidden md:block"
              />
              {/* Small screen logo */}
              <img
                src="/frenzyswap_logomark.svg"
                alt="FrenzySwap Logo"
                className="h-10 w-auto md:hidden"
              />
            </div>
            <p className="text-gray-500 text-body-sm max-w-xs text-center md:text-left">
              Professional DEX aggregator on Solana with best execution and transparent fees
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 w-full md:w-auto">
            <div>
              <h4 className="text-white font-semibold mb-4 text-body-md">Platform</h4>
              <div className="flex flex-col space-y-3">
                <a
                  href="/swap"
                  className="text-gray-400 hover:text-brand-purple transition-colors text-body-sm"
                >
                  Swap Tokens
                </a>
                <a
                  href="/analytics"
                  className="text-gray-400 hover:text-brand-purple transition-colors text-body-sm"
                >
                  Analytics
                </a>
                <a
                  href="/portfolio"
                  className="text-gray-400 hover:text-brand-purple transition-colors text-body-sm"
                >
                  Portfolio
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4 text-body-md">Legal</h4>
              <div className="flex flex-col space-y-3">
                <a
                  href="/legal/terms"
                  className="text-gray-400 hover:text-brand-purple transition-colors text-body-sm"
                >
                  Terms
                </a>
                <a
                  href="/legal/privacy"
                  className="text-gray-400 hover:text-brand-purple transition-colors text-body-sm"
                >
                  Privacy
                </a>
                <a
                  href="/legal/disclaimer"
                  className="text-gray-400 hover:text-brand-purple transition-colors text-body-sm"
                >
                  Disclaimer
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 text-body-md">Community</h4>
              <div className="flex flex-col space-y-3">
                <a
                  href="https://t.me/frenzyswap_dex"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-brand-blue transition-colors text-body-sm"
                >
                  Telegram
                </a>
                <a
                  href="https://x.com/frenzyswapdefi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-brand-blue transition-colors text-body-sm"
                >
                  X (Twitter)
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center">
          <p className="text-gray-500 text-body-sm">© {currentYear} FrenzySwap. All rights reserved.</p>
          <p className="mt-2 text-gray-600 text-body-xs">Built by Ticoworld</p>
        </div>
      </div>
    </footer>
  );
}
export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 flex flex-col items-center md:items-start">
            <div className="flex items-center mb-2">
              {/* Large screen logo */}
              <img
                src="/assets/logos/Frenzyswap.svg"
                alt="FrenzySwap Logo"
                className="h-10 w-auto hidden md:block"
              />
              {/* Small screen logo */}
              <img
                src="/assets/logos/frenzyswap_logomark.svg"
                alt="FrenzySwap Logo"
                className="h-10 w-auto md:hidden"
              />
            </div>
            <p className="text-gray-600 dark:text-gray-500 text-sm">
              Part of the MemeFrenzy ecosystem
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6">
            <div className="text-center">
              <h4 className="text-gray-700 dark:text-gray-400 mb-2">Platform</h4>
              <div className="flex flex-col space-y-1">
                <a
                  href="/swap"
                  className="text-gray-600 dark:text-gray-500 hover:text-yellow-600 dark:hover:text-yellow-500 text-sm font-medium"
                >
                  Swap Tokens
                </a>
                <a
                  href="/staking"
                  className="text-gray-600 dark:text-gray-500 hover:text-yellow-600 dark:hover:text-yellow-500 text-sm"
                >
                  Staking
                </a>
                <a
                  href="/dao"
                  className="text-gray-600 dark:text-gray-500 hover:text-yellow-600 dark:hover:text-yellow-500 text-sm"
                >
                  DAO
                </a>
              </div>
            </div>
            <div className="text-center">
              <h4 className="text-gray-700 dark:text-gray-400 mb-2">Legal</h4>
              <div className="flex flex-col space-y-1">
                <a
                  href="/legal/terms"
                  className="text-gray-600 dark:text-gray-500 hover:text-yellow-600 dark:hover:text-yellow-500 text-sm"
                >
                  Terms
                </a>
                <a
                  href="/legal/privacy"
                  className="text-gray-600 dark:text-gray-500 hover:text-yellow-600 dark:hover:text-yellow-500 text-sm"
                >
                  Privacy
                </a>
                <a
                  href="/legal/disclaimer"
                  className="text-gray-600 dark:text-gray-500 hover:text-yellow-600 dark:hover:text-yellow-500 text-sm"
                >
                  Disclaimer
                </a>
              </div>
            </div>

            <div className="text-center">
              <h4 className="text-gray-700 dark:text-gray-400 mb-2">Community</h4>
              <div className="flex flex-col space-y-1">
                <a
                  href="https://t.me/frenzyswap_dex"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 text-sm"
                >
                  Telegram
                </a>
                <a
                  href="https://x.com/frenzyswapdefi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 text-sm"
                >
                  X (Twitter)
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 text-center text-gray-600 dark:text-gray-500 text-sm">
          <p>© {currentYear} FrenzySwap. All rights reserved.</p>
          <p className="mt-1">Built by Ticoworld</p>
        </div>
      </div>
    </footer>
  );
}
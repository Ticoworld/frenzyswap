// src/components/swap/TokenSelector.tsx
"use client";

import { useEffect, useState, useCallback, useMemo, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import debounce from 'lodash/debounce';
import TokenImage from '../ui/TokenImage';
import TokenVerificationBadge from './TokenVerificationBadge';
import QuickTokenWarning from './QuickTokenWarning';
import { useTokenList } from '@/hooks/useTokenList';
import { Token } from '@/config/tokens';

export default function TokenSelector({ selectedToken, onSelect, disabledTokens = [] }: {
  selectedToken?: Token;
  onSelect: (token: Token) => void;
  disabledTokens?: string[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [warningToken, setWarningToken] = useState<Token | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const { tokens, loading, error, rateLimitError, retry, setSearchQuery: originalSetSearchQuery, searchFeedback } = useTokenList();

  const debouncedSetSearchQuery = useMemo(() => debounce((value: string) => {
    originalSetSearchQuery(value);
    setSearchValue(value);
  }, 300), [originalSetSearchQuery]);
  
  useEffect(() => () => debouncedSetSearchQuery.cancel(), [debouncedSetSearchQuery]);

  // Clear search when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchValue('');
      originalSetSearchQuery('');
    }
  }, [isOpen, originalSetSearchQuery]);

  const handleSelect = useCallback((token: Token) => {
    // Check if token needs verification warning
    const needsWarning = token.verified === false || 
                        token.isFromDexScreener === true || 
                        token.isJupiterFallback === true ||
                        token.tags?.includes('unverified');
    
    if (needsWarning) {
      setWarningToken(token);
    } else {
      onSelect(token);
      setIsOpen(false);
    }
  }, [onSelect]);

  const handleWarningConfirm = useCallback(() => {
    if (warningToken) {
      onSelect(warningToken);
      setWarningToken(null);
      setIsOpen(false);
    }
  }, [warningToken, onSelect]);

  const handleWarningCancel = useCallback(() => {
    setWarningToken(null);
  }, []);

  const TokenRow = useCallback(({ index, style }: { index: number, style: React.CSSProperties }) => {
    const token = tokens[index];
    const disabled = disabledTokens.includes(token.address);
    return (
      <button
        key={token.address}
        style={style}
        onClick={() => !disabled && handleSelect(token)}
        className={`flex items-center w-full p-3 transition focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-inset rounded-xl ${
          disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-900 hover:border hover:border-brand-purple/20'
        }`}
        disabled={disabled}
        aria-label={`Select ${token.symbol} (${token.name})${disabled ? ' - disabled' : ''}`}
        type="button"
      >
        <TokenImage src={token.logoURI} alt={token.name} symbol={token.symbol} address={token.address} className="w-8 h-8 rounded-full" />
        <div className="ml-3 text-left truncate flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-white truncate">{token.symbol}</span>
            <TokenVerificationBadge token={token} size="sm" />
          </div>
          <div className="text-sm text-gray-400 truncate">{token.name}</div>
        </div>
      </button>
    );
  }, [tokens, disabledTokens, handleSelect]);

  return (
    <div className="token-selector-wrapper">
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-[#0a0a0a] border-2 border-gray-800 hover:border-brand-purple/50 p-3 rounded-xl text-white flex items-center justify-between transition-colors focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2 focus:ring-offset-black"
        aria-label={selectedToken ? `Selected token: ${selectedToken.symbol}. Click to change.` : 'Select a token'}
        aria-haspopup="dialog"
        type="button"
      >
        {selectedToken ? (
          <div className="flex items-center">
            <TokenImage src={selectedToken.logoURI} alt={selectedToken.name} symbol={selectedToken.symbol} address={selectedToken.address} className="w-6 h-6 rounded-full mr-2" />
            <span className="mr-2 font-semibold">{selectedToken.symbol}</span>
            <TokenVerificationBadge token={selectedToken} size="sm" />
          </div>
        ) : (
          <span className="text-gray-400">Select Token</span>
        )}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5 ml-2 text-brand-purple"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      <Transition show={isOpen} as={Fragment}>
        <Dialog onClose={() => setIsOpen(false)} className="fixed inset-0 z-50">
          <Transition.Child as={Fragment}>
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
          </Transition.Child>
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-md bg-[#0a0a0a] rounded-2xl shadow-2xl border-2 border-gray-800">
              <div className="p-6">
                <Dialog.Title className="text-lg font-bold text-white mb-4">
                  Select Token
                </Dialog.Title>
                <input
                  placeholder="Search token by name or symbol"
                  value={searchValue}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchValue(value);
                    debouncedSetSearchQuery(value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setIsOpen(false);
                    }
                  }}
                  className="w-full p-3 mb-4 bg-black border-2 border-gray-800 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-brand-purple transition-colors"
                  autoFocus
                  aria-label="Search for tokens"
                />

              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center p-3">
                      <div className="w-8 h-8 mr-3 bg-gray-900 border-2 border-gray-800 rounded-full animate-pulse" />
                      <div className="flex-1 space-y-1">
                        <div className="w-1/4 h-4 bg-gray-900 border border-gray-800 rounded animate-pulse" />
                        <div className="w-1/2 h-3 bg-gray-900 border border-gray-800 rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center text-red-500 dark:text-red-400" role="alert">
                  {rateLimitError ? (
                    <>
                      {rateLimitError}
                      <button 
                        onClick={retry} 
                        className="mt-2 underline hover:no-underline focus:outline-none focus:ring-1 focus:ring-red-400 rounded"
                        aria-label="Retry loading tokens"
                      >
                        Retry
                      </button>
                    </>
                  ) : (
                    <>
                      Failed to load tokens.
                      <button 
                        onClick={retry} 
                        className="mt-2 underline hover:no-underline focus:outline-none focus:ring-1 focus:ring-red-400 rounded"
                        aria-label="Retry loading tokens"
                      >
                        Retry
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="h-[400px] custom-scrollbar">
                  {/* Show search feedback when there are no results */}
                  {searchFeedback && !searchFeedback.hasResults && searchFeedback.searchTerm && (
                    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                      {searchFeedback.isSearching ? (
                        <>
                          <div className="animate-spin w-8 h-8 border-2 border-brand-purple border-t-transparent rounded-full mb-4"></div>
                          <p className="text-gray-300 font-medium mb-2">
                            {searchFeedback.message || 'Searching...'}
                          </p>
                          <p className="text-gray-500 text-sm">
                            Looking for &ldquo;{searchFeedback.searchTerm}&rdquo;
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="w-16 h-16 bg-gray-900 border-2 border-gray-800 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                          <p className="text-gray-300 font-medium mb-2">No tokens found</p>
                          <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
                            {searchFeedback.message || `No results for &ldquo;${searchFeedback.searchTerm}&rdquo;`}
                          </p>
                          <button
                            onClick={() => {
                              setSearchValue('');
                              originalSetSearchQuery('');
                            }}
                            className="mt-4 text-brand-purple hover:text-brand-purple/80 text-sm underline"
                          >
                            Clear search
                          </button>
                        </>
                      )}
                    </div>
                  )}
                  
                  {/* Show token list when there are results */}
                  {(!searchFeedback || searchFeedback.hasResults) && tokens.length > 0 && (
                    <AutoSizer>
                      {({ height, width }) => (
                        <FixedSizeList
                          height={height}
                          width={width}
                          itemCount={tokens.length}
                          itemSize={72}
                          overscanCount={10}
                        >
                          {TokenRow}
                        </FixedSizeList>
                      )}
                    </AutoSizer>
                  )}
                  
                  {/* Show empty state when no search is active but no tokens */}
                  {(!searchFeedback || !searchFeedback.searchTerm) && tokens.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-gray-400 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">No tokens available</p>
                      <p className="text-gray-500 dark:text-gray-500 text-sm">
                        Unable to load token list. Please try again.
                      </p>
                    </div>
                  )}
                </div>
              )}
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>

      {/* Quick Token Warning Modal */}
      {warningToken && (
        <QuickTokenWarning
          token={warningToken}
          isOpen={!!warningToken}
          onConfirm={handleWarningConfirm}
          onCancel={handleWarningCancel}
        />
      )}
    </div>
  );
}
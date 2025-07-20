// src/components/swap/TokenSelector.tsx
"use client";

import { useEffect, useState, useCallback, useMemo, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import debounce from 'lodash/debounce';
import TokenImage from '../ui/TokenImage';
import { useTokenList } from '@/hooks/useTokenList';
import { Token } from '@/config/tokens';

export default function TokenSelector({ selectedToken, onSelect, disabledTokens = [] }: {
  selectedToken?: Token;
  onSelect: (token: Token) => void;
  disabledTokens?: string[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { tokens, loading, error, rateLimitError, retry, setSearchQuery: originalSetSearchQuery } = useTokenList();

  const debouncedSetSearchQuery = useMemo(() => debounce(originalSetSearchQuery, 300), [originalSetSearchQuery]);
  useEffect(() => () => debouncedSetSearchQuery.cancel(), [debouncedSetSearchQuery]);

  const handleSelect = useCallback((token: Token) => {
    onSelect(token);
    setIsOpen(false);
  }, [onSelect]);

  const TokenRow = useCallback(({ index, style }: { index: number, style: React.CSSProperties }) => {
    const token = tokens[index];
    const disabled = disabledTokens.includes(token.address);
    return (
      <button
        key={token.address}
        style={style}
        onClick={() => !disabled && handleSelect(token)}
        className={`flex items-center w-full p-3 transition focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-inset ${
          disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-700'
        }`}
        disabled={disabled}
        aria-label={`Select ${token.symbol} (${token.name})${disabled ? ' - disabled' : ''}`}
        type="button"
      >
        <TokenImage src={token.logoURI} alt={token.name} symbol={token.symbol} className="w-8 h-8 rounded-full" />
        <div className="ml-3 text-left truncate">
          <div className="font-medium text-white truncate">{token.symbol}</div>
          <div className="text-sm text-gray-400 truncate">{token.name}</div>
        </div>
      </button>
    );
  }, [tokens, disabledTokens, handleSelect]);

  return (
    <div className="token-selector-wrapper"> {/* Renamed for clarity, not strictly needed for scrollbar */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-gray-800 p-3 rounded-lg text-white flex items-center justify-between hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        aria-label={selectedToken ? `Selected token: ${selectedToken.symbol}. Click to change.` : 'Select a token'}
        aria-haspopup="dialog"
        type="button"
      >
        {selectedToken ? (
          <div className="flex items-center"> {/* Container for image and symbol */}
            <TokenImage src={selectedToken.logoURI} alt={selectedToken.name} symbol={selectedToken.symbol} className="w-6 h-6 rounded-full mr-2" />
            <span>{selectedToken.symbol}</span>
          </div>
        ) : (
          <span>Select Token</span>
        )}
        {/* Dropdown arrow icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-4 h-4 ml-2"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      <Transition show={isOpen} as={Fragment}>
        <Dialog onClose={() => setIsOpen(false)} className="fixed inset-0 z-50">
          <Transition.Child as={Fragment}>
            <div className="fixed inset-0 bg-black/50" />
          </Transition.Child>
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-md bg-gray-900 rounded-xl shadow-2xl">
              <div className="p-6">
                <Dialog.Title className="text-lg font-semibold text-white mb-4">
                  Select Token
                </Dialog.Title>
                <input
                  placeholder="Search token by name or symbol"
                  onChange={(e) => debouncedSetSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setIsOpen(false);
                    }
                  }}
                  className="w-full p-3 mb-4 bg-gray-700 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:bg-gray-600"
                  autoFocus
                  aria-label="Search for tokens"
                />

              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center p-3">
                      <div className="w-8 h-8 mr-3 bg-gray-700 rounded-full animate-pulse" />
                      <div className="flex-1 space-y-1">
                        <div className="w-1/4 h-4 bg-gray-700 rounded" />
                        <div className="w-1/2 h-3 bg-gray-700 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center text-red-400" role="alert">
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
                <div className="h-[400px] custom-scrollbar"> {/* Added custom-scrollbar class here */}
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
                </div>
              )}
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
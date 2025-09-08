// src/components/swap/SwapForm.tsx
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import TokenSelector from './TokenSelector';
import Settings from './Settings';
import SwapButton from './SwapButton';
import { Token, MEME_TOKEN } from '@/config/tokens';
import { useWallet } from '@solana/wallet-adapter-react';
import { useTokenList } from '@/hooks/useTokenList';
import { useSwap } from '@/hooks/useSwap';
import { getQuote, isValidQuote } from '@/lib/jupiter';
import { toSmallestUnit, fromSmallestUnit } from '@/lib/utils';
import { Connection, PublicKey } from '@solana/web3.js';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaExchangeAlt, FaFire, FaInfoCircle, FaShare } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { QuoteLoader, BalanceSkeleton, SwapPreviewSkeleton, TokenSelectorSkeleton } from '@/components/ui/SkeletonLoader';
import SwapConfirmation from './TransactionConfirmation';
import NetworkStatus from '@/components/ui/NetworkStatus';
import ErrorDisplay from '@/components/ui/ErrorDisplay';
import { toast } from 'react-hot-toast';

export default function SwapForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { publicKey, connected } = useWallet();
  const { tokens, loading: tokensLoading } = useTokenList();
  const { performSwap, swapError } = useSwap(); // ✅ include swapError

  const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com';
  const connection = useMemo(() => new Connection(RPC_URL), [RPC_URL]);
  const referralAccount = process.env.NEXT_PUBLIC_REFERRAL_ACCOUNT;

  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromTokenLoading, setFromTokenLoading] = useState(false);
  const [toTokenLoading, setToTokenLoading] = useState(false);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [quote, setQuote] = useState<any>(null);
  const [priceImpact, setPriceImpact] = useState<number | null>(null);
  const [memeFee, setMemeFee] = useState(0);
  const [referralFee, setReferralFee] = useState(0);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [toBalance, setToBalance] = useState<number | null>(null);
  const [toBalanceLoading, setToBalanceLoading] = useState(false);
  const [showSwapPreview, setShowSwapPreview] = useState(false);

  // Generate shareable URL for current swap configuration
  const generateShareURL = useCallback(() => {
    if (!fromToken || !toToken) return '';
    
    const baseURL = typeof window !== 'undefined' ? window.location.origin : '';
    const params = new URLSearchParams();
    
    // Use both mint addresses and symbols for maximum compatibility
    params.set('inputMint', fromToken.address);
    params.set('outputMint', toToken.address);
    params.set('from', fromToken.symbol);
    params.set('to', toToken.symbol);
    
    if (fromAmount && parseFloat(fromAmount) > 0) {
      params.set('amount', fromAmount);
    }
    
    return `${baseURL}/swap?${params.toString()}`;
  }, [fromToken, toToken, fromAmount]);

  // Handle share button click
  const handleShare = async () => {
    const shareURL = generateShareURL();
    if (!shareURL) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Swap ${fromToken?.symbol} for ${toToken?.symbol} on FrenzySwap`,
          text: `Check out this swap on FrenzySwap!`,
          url: shareURL
        });
      } else {
        await navigator.clipboard.writeText(shareURL);
        toast.success('Swap link copied to clipboard!');
      }
    } catch (error) {
      console.error('Failed to share:', error);
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareURL);
        toast.success('Swap link copied to clipboard!');
      } catch (clipboardError) {
        console.error('Failed to copy to clipboard:', clipboardError);
        toast.error('Failed to share link');
      }
    }
  };

  useEffect(() => {
    // Check if URL parameters exist to avoid default token flash
    const hasUrlParams = searchParams.get('inputMint') || searchParams.get('outputMint') || 
                         searchParams.get('from') || searchParams.get('to');
    
    if (tokens.length > 0 && !fromToken && !hasUrlParams) {
      // Only set defaults if no URL params exist
      const usdc = tokens.find(t => t.symbol === 'USDC');
      if (usdc) setFromToken(usdc);
    }
    if (tokens.length > 0 && !toToken && MEME_TOKEN && !hasUrlParams) {
      setToToken(MEME_TOKEN);
    }
  }, [tokens, fromToken, toToken, searchParams]);

  // Smart token lookup function for unknown addresses
  const findOrFetchToken = useCallback(async (address: string, isFromToken: boolean = true): Promise<Token | null> => {
    // First, try to find in existing tokens
    const existing = tokens.find(t => t.address === address);
    if (existing) return existing;

    // If not found and looks like a valid Solana address, try DexScreener
    if (address.length >= 32 && /^[A-Za-z0-9]{32,}$/.test(address)) {
      try {
        // Set loading state
        if (isFromToken) {
          setFromTokenLoading(true);
        } else {
          setToTokenLoading(true);
        }

        console.log(`[SwapForm] 🔍 Unknown token ${address}, searching DexScreener...`);
        const response = await fetch(`/api/tokens/search?q=${address}`);
        if (response.ok) {
          const token = await response.json();
          console.log(`[SwapForm] ✅ Found token via DexScreener: ${token.symbol}`);
          
          // Add to global token list for future use (avoid repeated API calls)
          const updatedTokens = [...tokens, token];
          console.log(`[SwapForm] 📦 Added ${token.symbol} to local token cache`);
          
          return token;
        }
      } catch (error) {
        console.log(`[SwapForm] ❌ DexScreener lookup failed for ${address}`);
      } finally {
        // Clear loading state
        if (isFromToken) {
          setFromTokenLoading(false);
        } else {
          setToTokenLoading(false);
        }
      }
    }
    
    return null;
  }, [tokens]);

  // Handle URL parameters for pre-filled swaps with smart lookup
  useEffect(() => {
    if (tokens.length === 0) return;

    const handleUrlParams = async () => {
      const inputMint = searchParams.get('inputMint');
      const outputMint = searchParams.get('outputMint'); 
      const fromSymbol = searchParams.get('from');
      const toSymbol = searchParams.get('to');
      const amount = searchParams.get('amount');

      console.log(`[SwapForm] 🔗 Processing URL params: inputMint=${inputMint}, outputMint=${outputMint}`);

      // Handle inputMint parameter with smart lookup (highest priority)
      if (inputMint && !fromToken) {
        const token = await findOrFetchToken(inputMint, true);
        if (token) {
          console.log(`[SwapForm] ✅ Set FROM token via inputMint: ${token.symbol}`);
          setFromToken(token);
        } else {
          console.log(`[SwapForm] ⚠️ Could not find or fetch token: ${inputMint}`);
          // Fallback to symbol if mint address fails
          if (fromSymbol) {
            const symbolToken = tokens.find(t => t.symbol.toLowerCase() === fromSymbol.toLowerCase());
            if (symbolToken) {
              console.log(`[SwapForm] 📝 Fallback to FROM symbol: ${symbolToken.symbol}`);
              setFromToken(symbolToken);
            }
          }
        }
      } else if (fromSymbol && !fromToken && !inputMint) {
        // Handle from parameter (symbol-based) only if no inputMint
        const token = tokens.find(t => t.symbol.toLowerCase() === fromSymbol.toLowerCase());
        if (token) {
          console.log(`[SwapForm] 📝 Set FROM token via symbol: ${token.symbol}`);
          setFromToken(token);
        }
      }

      // Handle outputMint parameter with smart lookup (highest priority)
      if (outputMint && !toToken) {
        const token = await findOrFetchToken(outputMint, false);
        if (token) {
          console.log(`[SwapForm] ✅ Set TO token via outputMint: ${token.symbol}`);
          setToToken(token);
        } else {
          console.log(`[SwapForm] ⚠️ Could not find or fetch token: ${outputMint}`);
          // Fallback to symbol if mint address fails
          if (toSymbol) {
            const symbolToken = tokens.find(t => t.symbol.toLowerCase() === toSymbol.toLowerCase());
            if (symbolToken) {
              console.log(`[SwapForm] 📝 Fallback to TO symbol: ${symbolToken.symbol}`);
              setToToken(symbolToken);
            }
          }
        }
      } else if (toSymbol && !toToken && !outputMint) {
        // Handle to parameter (symbol-based) only if no outputMint
        const token = tokens.find(t => t.symbol.toLowerCase() === toSymbol.toLowerCase());
        if (token) {
          console.log(`[SwapForm] 📝 Set TO token via symbol: ${token.symbol}`);
          setToToken(token);
        }
      }

      // Handle amount parameter
      if (amount && !fromAmount) {
        console.log(`[SwapForm] 💰 Set amount from URL: ${amount}`);
        setFromAmount(amount);
      }
    };

    handleUrlParams();
  }, [tokens, searchParams, fromToken, toToken, fromAmount, findOrFetchToken]);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!publicKey || !fromToken) {
        setBalance(null);
        return;
      }

      try {
        setBalanceLoading(true);
        let currentBalance: number;

        if (fromToken.symbol === 'SOL') {
          const lamports = await connection.getBalance(publicKey);
          currentBalance = fromSmallestUnit(BigInt(lamports), 9);
        } else {
          const tokenAccounts = await connection.getTokenAccountsByOwner(
            publicKey,
            { mint: new PublicKey(fromToken.address) }
          );

          if (tokenAccounts.value.length > 0) {
            const tokenAccountInfo = await connection.getParsedAccountInfo(
              tokenAccounts.value[0].pubkey
            );
            if (tokenAccountInfo.value && (tokenAccountInfo.value.data as any).parsed) {
              const parsedData = (tokenAccountInfo.value.data as any).parsed.info;
              currentBalance = parseFloat(parsedData.tokenAmount.uiAmountString);
            } else {
              currentBalance = 0;
            }
          } else {
            currentBalance = 0;
          }
        }
        setBalance(currentBalance);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to fetch balance', error);
        }
        setBalance(0);
      } finally {
        setBalanceLoading(false);
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [publicKey, fromToken, connection]);

  // Fetch balance for "to" token
  useEffect(() => {
    const fetchToBalance = async () => {
      if (!publicKey || !toToken) {
        setToBalance(null);
        return;
      }

      try {
        setToBalanceLoading(true);
        let currentBalance: number;

        if (toToken.symbol === 'SOL') {
          const lamports = await connection.getBalance(publicKey);
          currentBalance = fromSmallestUnit(BigInt(lamports), 9);
        } else {
          const tokenAccounts = await connection.getTokenAccountsByOwner(
            publicKey,
            { mint: new PublicKey(toToken.address) }
          );

          if (tokenAccounts.value.length > 0) {
            const tokenAccountInfo = await connection.getParsedAccountInfo(
              tokenAccounts.value[0].pubkey
            );
            if (tokenAccountInfo.value && (tokenAccountInfo.value.data as any).parsed) {
              const parsedData = (tokenAccountInfo.value.data as any).parsed.info;
              currentBalance = parseFloat(parsedData.tokenAmount.uiAmountString);
            } else {
              currentBalance = 0;
            }
          } else {
            currentBalance = 0;
          }
        }
        setToBalance(currentBalance);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to fetch to token balance', error);
        }
        setToBalance(0);
      } finally {
        setToBalanceLoading(false);
      }
    };

    fetchToBalance();
    const interval = setInterval(fetchToBalance, 30000);
    return () => clearInterval(interval);
  }, [publicKey, toToken, connection]);

  useEffect(() => {
    if (fromToken && toToken && fromToken.address === toToken.address) {
      const temp = fromToken;
      setFromToken(toToken);
      setToToken(temp);
    }
  }, [fromToken, toToken]);

  const fetchQuote = useCallback(async () => {
    if (!fromToken || !toToken || !fromAmount || parseFloat(fromAmount) <= 0) {
      setToAmount('');
      setQuote(null);
      setPriceImpact(null);
      setMemeFee(0);
      setReferralFee(0);
      setError(null);
      return;
    }

    const fromAmountNum = parseFloat(fromAmount);

    if (balance !== null && fromAmountNum > 0) {
      // Calculate required balance: swap amount + platform fee (0.3%)
      const platformFee = fromAmountNum * 0.003;
      const totalRequired = fromAmountNum + platformFee;
      
      if (totalRequired > balance) {
        // Check if this is very close due to rounding (within 0.000001)
        const difference = totalRequired - balance;
        if (difference > 0.000001) {
          setError(`Insufficient ${fromToken.symbol} balance. You have ${balance.toFixed(6)} ${fromToken.symbol} but need ${totalRequired.toFixed(6)} (including 0.3% fees)`);
          setToAmount('');
          setQuote(null);
          setPriceImpact(null);
          setMemeFee(0);
          setReferralFee(0);
          return;
        }
      }
      
      // Clear error if we had one but now balance is sufficient
      if (error && error.includes('Insufficient')) {
        setError(null);
      }
    }

    try {
      setQuoteLoading(true);
      const amount = toSmallestUnit(parseFloat(fromAmount), fromToken.decimals).toString();
      let quote;
      try {
        quote = await getQuote(fromToken.address, toToken.address, amount, slippage, referralAccount);
      } catch (error: any) {
        if (!navigator.onLine) {
          setError('Network disconnected. Please check your connection and try again.');
        } else if (error.code === 'ECONNABORTED' || error.message?.includes('NetworkError')) {
          setError('Network error. Please try again.');
        } else {
          setError(error.message || 'Failed to fetch quote');
        }
        setQuoteLoading(false);
        return;
      }

      if (!isValidQuote(quote)) {
        setError('No valid route found for this swap');
        setQuoteLoading(false);
        return;
      }

      const output = fromSmallestUnit(BigInt(quote.outAmount), toToken.decimals);

      if (process.env.NODE_ENV === 'development') {
        console.log('Jupiter Quote Debug:', {
          inputMint: quote.inputMint,
          outputMint: quote.outputMint,
          inAmount: quote.inAmount,
          outAmount: quote.outAmount,
          calculatedOutput: output,
          rawQuote: quote
        });
      }

      setToAmount(output.toFixed(6));
      setQuote(quote);

      if (quote.priceImpactPct) {
        setPriceImpact(parseFloat((parseFloat(quote.priceImpactPct) * 100).toFixed(2)));
      }

      const platformFeeAmount = parseFloat(fromAmount) * 0.003;
      setMemeFee(platformFeeAmount * 0.67);
      setReferralFee(platformFeeAmount * 0.33);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch quote');
      setQuote(null);
      setToAmount('');
      setPriceImpact(null);
      setMemeFee(0);
      setReferralFee(0);
    } finally {
      setQuoteLoading(false);
    }
  }, [fromToken, toToken, fromAmount, slippage, referralAccount, balance, error]);

  useEffect(() => {
    const timeout = setTimeout(fetchQuote, 400);
    return () => clearTimeout(timeout);
  }, [fetchQuote]);

  // ✅ Toast when Jupiter swap fails
  useEffect(() => {
    if (swapError) {
      toast.error(swapError, {
        duration: 5000,
        position: 'top-right',
      });
    }
  }, [swapError]);

  const handleSwap = async () => {
    if (!quote || !fromToken || !toToken || !publicKey || !referralAccount) return;

    const fromAmountNum = parseFloat(fromAmount);
    if (balance === null || fromAmountNum > balance) {
      setError(`Insufficient ${fromToken.symbol} balance`);
      return;
    }

    const totalRequired = fromAmountNum + (fromAmountNum * 0.003);
    if (totalRequired > balance) {
      setError(`Not enough ${fromToken.symbol} for swap + fees`);
      return;
    }

    setIsConfirming(true);

    try {
      const tx = await performSwap(quote, publicKey.toString(), referralAccount, connection);
      setTxHash(tx);

      // 📊 Log swap data for analytics with real USD prices
      try {
        // Dynamically import fetchTokenPrices to avoid circular import
        const { fetchTokenPrices } = await import('@/lib/fetchTokenPrices');
        // Only fetch prices for fromToken and toToken
        const mints = [fromToken.address, toToken.address];
        const prices = await fetchTokenPrices(mints);
        const fromTokenPrice = prices.find(p => p.mint === fromToken.address)?.price || 0;
        const toTokenPrice = prices.find(p => p.mint === toToken.address)?.price || 0;

        const fromUsdValue = fromAmountNum * fromTokenPrice;
        const toUsdValue = parseFloat(toAmount) * toTokenPrice;
        // Platform fee is always in fromToken, so use fromTokenPrice
        const feesUsdValue = memeFee * fromTokenPrice;

        await fetch('/api/log-swap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress: publicKey.toString(),
            fromToken: fromToken.symbol,
            toToken: toToken.symbol,
            fromAmount: fromAmountNum,
            toAmount: parseFloat(toAmount),
            fromUsdValue,
            toUsdValue,
            feesPaid: memeFee,
            feesUsdValue,
            signature: tx,
            blockTime: Math.floor(Date.now() / 1000),
            jupiterFee: referralFee,
            platformFee: memeFee,
            memeBurned: memeFee, // MEME tokens burned as fees
            slippage: slippage / 100,
            routePlan: JSON.stringify(quote?.routePlan || {}),
            fee_token_symbol: fromToken.symbol,
            fee_token_mint: fromToken.address
          })
        });
      } catch (logError) {
        // Don't fail the swap if logging fails
        console.error('Failed to log swap:', logError);
      }

      router.push(`/swap/tx/${tx}?fromToken=${fromToken.symbol}&toToken=${toToken?.symbol}&fromAmount=${fromAmount}&toAmount=${toAmount}`);
    } catch (err: any) {
      setError(err.message || 'Swap execution failed');
    } finally {
      setIsConfirming(false);
    }
  };

  const resetSwap = () => {
    setTxHash(null);
    setFromAmount('');
    setToAmount('');
    setQuote(null);
    setError(null);
    // Note: We don't reset balances as they should persist for the selected tokens
  };

  const handleMaxClick = (percentage: number) => {
    if (balance === null || !connected) return;
    let maxAmount: number;
    
    if (percentage === 1) {
      // For MAX, calculate the actual maximum we can swap including the 0.3% fee
      // We need: swapAmount + (swapAmount * 0.003) <= balance
      // So: swapAmount * (1 + 0.003) <= balance
      // Therefore: swapAmount <= balance / 1.003
      maxAmount = balance / 1.003;
      
      // Add a tiny buffer to account for floating point precision
      maxAmount = maxAmount * 0.9999;
    } else {
      // For percentages, just take that percentage of balance
      // Users can manually adjust if they want exactly that percentage
      maxAmount = balance * percentage;
    }
    
    setFromAmount(maxAmount.toFixed(6));
    setError(null);
  };

  const handleSwapTokens = () => {
    if (!fromToken || !toToken) return;
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  return (
    <div className="bg-gray-800 rounded-2xl p-3 sm:p-6 shadow-xl w-full max-w-[calc(100vw-1rem)] sm:max-w-md border border-gray-700 mx-auto min-h-fit">
      {/* Header with Network Status */}
      <div className="flex justify-between items-center mb-3 sm:mb-4">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <h1 className="text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            FRENZYSWAP
          </h1>
          <NetworkStatus showLabel={false} className="hidden sm:flex" />
        </div>
        <div className="flex items-center space-x-2">
          <NetworkStatus showLabel={false} className="flex sm:hidden scale-90" />
          <Settings slippage={slippage} setSlippage={setSlippage} />
        </div>
      </div>

      {txHash ? (
        <SwapConfirmation
          txHash={txHash}
          fromToken={fromToken}
          toToken={toToken}
          fromAmount={fromAmount}
          toAmount={toAmount}
          memeFee={memeFee}
          onContinue={resetSwap}
        />
      ) : isConfirming ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mb-4"></div>
          <h3 className="text-lg font-medium mb-1">Confirming Swap</h3>
          <p className="text-gray-400 text-sm">Approve the transaction in your wallet</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3 sm:space-y-4"
        >
          {/* FROM */}
          <div className="bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <label className="text-gray-400 text-sm font-medium">From</label>
              <div className="flex space-x-1 sm:space-x-2">
                <button
                  className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded transition-colors focus:outline-none focus:ring-1 focus:ring-gray-500"
                  onClick={() => handleMaxClick(0.25)}
                  disabled={!balance || !connected}
                  aria-label="Use 25% of balance"
                >
                  25%
                </button>
                <button
                  className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded transition-colors focus:outline-none focus:ring-1 focus:ring-gray-500"
                  onClick={() => handleMaxClick(0.5)}
                  disabled={!balance || !connected}
                  aria-label="Use 50% of balance"
                >
                  50%
                </button>
                <button
                  className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded transition-colors focus:outline-none focus:ring-1 focus:ring-gray-500"
                  onClick={() => handleMaxClick(0.75)}
                  disabled={!balance || !connected}
                  aria-label="Use 75% of balance"
                >
                  75%
                </button>
                <button
                  className="text-xs bg-yellow-500 hover:bg-yellow-400 text-black px-2 py-1 rounded font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-yellow-600"
                  onClick={() => handleMaxClick(1)}
                  disabled={!balance || !connected}
                  aria-label="Use maximum balance"
                >
                  MAX
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex-1">
                <input
                  type="number"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  placeholder="0.0"
                  className="bg-transparent text-xl sm:text-2xl w-full outline-none placeholder:text-gray-500 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:ring-0"
                  aria-label={`Enter amount to swap from ${fromToken?.symbol || 'selected token'}`}
                  disabled={!fromToken}
                  min="0"
                  step="any"
                  inputMode="decimal"
                />
              </div>
              <div className="flex-shrink-0">
                {fromTokenLoading ? (
                  <TokenSelectorSkeleton />
                ) : (
                  <TokenSelector
                    selectedToken={fromToken ?? undefined}
                    onSelect={setFromToken}
                    disabledTokens={toToken ? [toToken.address] : []}
                  />
                )}
              </div>
            </div>
            <div className="mt-2 text-sm">
              {balanceLoading ? (
                <BalanceSkeleton />
              ) : balance !== null ? (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">
                    Balance: {balance.toFixed(6)} {fromToken?.symbol || ''}
                  </span>
                  {balance > 0 && (
                    <button 
                      onClick={() => handleMaxClick(1)}
                      className="text-yellow-500 hover:text-yellow-400 text-xs underline focus:outline-none focus:ring-1 focus:ring-yellow-500 rounded"
                      aria-label={`Use maximum ${fromToken?.symbol} balance`}
                    >
                      Use Max
                    </button>
                  )}
                </div>
              ) : connected ? (
                <span className="text-gray-400">Balance: 0.0</span>
              ) : (
                <span className="text-gray-400">Balance: -</span>
              )}
            </div>
          </div>

          {/* SWAP ICON & SHARE */}
          <div className="flex justify-center items-center gap-4 -my-2 z-10 relative">
            {/* Share Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="bg-gray-900 border-2 border-gray-800 p-2 rounded-full text-blue-500 hover:bg-gray-800 hover:border-blue-500 transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              aria-label="Share swap link"
              disabled={!fromToken || !toToken}
            >
              <FaShare className="h-4 w-4" />
            </motion.button>

            {/* Flip Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSwapTokens}
              className="bg-gray-900 border-2 border-gray-800 p-2 rounded-full text-yellow-500 hover:bg-gray-800 hover:border-yellow-500 transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              aria-label="Swap token positions"
              disabled={!fromToken || !toToken}
            >
              <FaExchangeAlt className="h-5 w-5" />
            </motion.button>
          </div>

          {/* TO */}
          <div className="bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-700">
            <div className="mb-2 text-gray-400 text-sm font-medium">To</div>
            <div className="flex items-center">
              <div className="flex-1">
                {quoteLoading ? (
                  <QuoteLoader />
                ) : (
                  <input
                    type="text"
                    value={toAmount}
                    readOnly
                    className="bg-transparent text-xl sm:text-2xl w-full outline-none text-gray-300 cursor-not-allowed"
                    placeholder="0.0"
                    aria-label={`Amount to receive in ${toToken?.symbol || 'selected token'}`}
                    tabIndex={-1}
                  />
                )}
              </div>
              <div className="flex-shrink-0">
                {toTokenLoading ? (
                  <TokenSelectorSkeleton />
                ) : (
                  <TokenSelector
                    selectedToken={toToken ?? undefined}
                    onSelect={setToToken}
                    disabledTokens={fromToken ? [fromToken.address] : []}
                  />
                )}
              </div>
            </div>
            <div className="mt-2 text-sm">
              {toBalanceLoading ? (
                <BalanceSkeleton />
              ) : toBalance !== null ? (
                <span className="text-gray-400">
                  Balance: {toBalance.toFixed(6)} {toToken?.symbol || ''}
                </span>
              ) : connected ? (
                <span className="text-gray-400">Balance: 0.0</span>
              ) : (
                <span className="text-gray-400">Balance: -</span>
              )}
            </div>
          </div>

          {/* INFO SECTION */}
          {quoteLoading && fromAmount && toAmount ? (
            <SwapPreviewSkeleton />
          ) : quote && fromToken && toToken ? (
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 text-sm space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Rate</span>
                <span className="font-medium">
                  {fromAmount && toAmount && !quoteLoading
                    ? `1 ${fromToken.symbol} = ${(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(6)} ${toToken.symbol}`
                    : '-'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Slippage</span>
                <span className="font-medium">{slippage}%</span>
              </div>
              {priceImpact !== null && (
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-1">
                    <span className="text-gray-400">Price Impact</span>
                    {priceImpact > 2 && (
                      <FaInfoCircle 
                        className="h-3 w-3 text-yellow-500" 
                        title="High price impact warning"
                      />
                    )}
                  </div>
                  <span className={`font-medium ${priceImpact > 2 ? 'text-red-400' : 'text-green-400'}`}>
                    {priceImpact}%
                  </span>
                </div>
              )}
              <div className="border-t border-gray-700 pt-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-xs">MEME Fee (0.2%)</span>
                  <span className="text-yellow-500 text-xs font-medium">
                    {memeFee.toFixed(6)} {fromToken.symbol}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-xs">Referral Fee (0.1%)</span>
                  <span className="text-purple-400 text-xs font-medium">
                    {referralFee.toFixed(6)} {fromToken.symbol}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-gray-700">
                  <span className="text-gray-300 text-xs font-medium">Total Fees</span>
                  <span className="text-gray-300 text-xs font-medium">
                    {(memeFee + referralFee).toFixed(6)} {fromToken.symbol}
                  </span>
                </div>
              </div>
            </div>
          ) : null}

          {/* BURN NOTICE */}
          <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/30 rounded-xl p-3 flex items-start">
            <div className="bg-yellow-500/20 p-1 rounded mr-2 mt-0.5 flex-shrink-0">
              <FaFire className="h-4 w-4 text-yellow-500" />
            </div>
            <p className="text-yellow-500 text-xs sm:text-sm">
              {memeFee.toFixed(6)} {fromToken?.symbol} will be used to buyback and burn MEME tokens
            </p>
          </div>

          {/* ERROR & RETRY */}
          {error && (
            <ErrorDisplay
              error={error}
              onRetry={() => {
                setError(null);
                setQuoteLoading(true);
                fetchQuote();
              }}
              showRetry={true}
            />
          )}

          {/* SWAP BUTTON */}
          <SwapButton
            disabled={
              !quote ||
              !!error ||
              quoteLoading ||
              parseFloat(fromAmount) <= 0 ||
              (balance !== null && (parseFloat(fromAmount) + memeFee + referralFee) > balance)
            }
            isLoading={quoteLoading}
            onClick={handleSwap}
          />
        </motion.div>
      )}
    </div>
  );
}
// src/lib/jupiter.ts - Enhanced Jupiter v6 API integration

import axios from 'axios';
import axiosRetry from 'axios-retry';
import { VersionedTransaction, Transaction, Connection } from '@solana/web3.js';
import type { Token, QuoteResponse, SwapRequest, SwapResponse } from '@/config/types';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import { quoteCache } from './quoteCache'; // ⚡ SPEED OPTIMIZATION: Import quote cache

// Base URLs - Official Jupiter Swap API v1
const JUPITER_BASE_URL = 'https://lite-api.jup.ag';
const QUOTE_API_URL = 'https://lite-api.jup.ag';

// Create Axios instance with retry + timeout
const http = axios.create({
  baseURL: JUPITER_BASE_URL,
  timeout: 12000, // ⚡ SPEED OPTIMIZATION: Reduced from 15s to 12s
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
  },
});

axiosRetry(http, {
  retries: 2, // ⚡ SPEED OPTIMIZATION: Reduced from 3 to 2 retries
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) =>
    axiosRetry.isNetworkOrIdempotentRequestError(error) || error.code === 'ECONNABORTED',
});

// --- 1. Validate Quote Response ---
const validateQuoteResponse = (data: any): QuoteResponse => {
  if (!data) {
    throw new Error('Empty quote response from Jupiter');
  }

  const requiredFields = ['inputMint', 'outputMint', 'inAmount', 'outAmount', 'routePlan'];
  for (const field of requiredFields) {
    if (!data[field]) {
      throw new Error(`Missing required field in quote response: ${field}`);
    }
  }

  if (!Array.isArray(data.routePlan) || data.routePlan.length === 0) {
    throw new Error('No valid route plan found in quote response');
  }

  return data as QuoteResponse;
};

// --- 2. Get Live Price of a Token ---
export const getTokenPrice = async (mintAddress: string): Promise<number | undefined> => {
  try {
    const { data } = await http.get(`/price/${mintAddress}`);
    return data?.priceUsd ? parseFloat(data.priceUsd) : undefined;
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`Failed to fetch token price for ${mintAddress}:`, err);
    }
    return undefined;
  }
};

// --- 3. Get Quote for a Swap ---
export const getQuote = async (
  inputMint: string,
  outputMint: string,
  amount: string,
  slippage: number,
  referralAccount?: string
): Promise<QuoteResponse> => {
  // Validate inputs
  if (!inputMint || !outputMint || !amount) {
    throw new Error('Missing required parameters for quote request');
  }

  if (parseFloat(amount) <= 0) {
    throw new Error('Amount must be greater than 0');
  }

  // ⚡ SPEED OPTIMIZATION: Check cache first
  const cachedQuote = quoteCache.get(inputMint, outputMint, amount, slippage);
  if (cachedQuote) {
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 Cache hit for quote:', { inputMint, outputMint, amount, slippage });
    }
    return cachedQuote;
  }

  const params: Record<string, any> = {
    inputMint,
    outputMint,
    amount,
    slippageBps: Math.round(slippage * 100),
    onlyDirectRoutes: false,
    maxAccounts: 64,
    swapMode: 'ExactIn',
    restrictIntermediateTokens: true,
  };

  // Add platform fee for revenue generation (Updated Jupiter API 2025)
  if (referralAccount) {
    params.platformFeeBps = 30; // 0.3% platform fee
  }

  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('Fetching quote with params:', params);
    }
    
    const response = await axios.get(`${QUOTE_API_URL}/swap/v1/quote`, { 
      params,
      timeout: 8000, // ⚡ SPEED OPTIMIZATION: Reduced from 10s to 8s
      headers: {
        'Accept': 'application/json',
      }
    });
    
    const validatedQuote = validateQuoteResponse(response.data);
    
    // ⚡ SPEED OPTIMIZATION: Cache the successful quote
    quoteCache.set(inputMint, outputMint, amount, slippage, validatedQuote);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Quote received and cached:', {
        inAmount: validatedQuote.inAmount,
        outAmount: validatedQuote.outAmount,
        priceImpactPct: validatedQuote.priceImpactPct,
        routePlan: validatedQuote.routePlan?.length || 0,
        swapMode: validatedQuote.swapMode
      });
    }
    
    return validatedQuote;
  } catch (err: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Jupiter quote fetch error:', err);
    }
    
    if (err.response?.status === 400) {
      const errorData = err.response?.data;
      
      // More specific error handling based on Jupiter's response
      if (errorData?.error?.includes('insufficient liquidity')) {
        throw new Error('Insufficient liquidity for this token pair. Try a smaller amount.');
      }
      if (errorData?.error?.includes('slippage tolerance exceeded')) {
        throw new Error('Price impact too high. Increase slippage tolerance or reduce amount.');
      }
      if (errorData?.error?.includes('token not supported')) {
        throw new Error('Token not supported by Jupiter. This token may be restricted or have limited liquidity.');
      }
      if (errorData?.error?.includes('amount too small')) {
        throw new Error('Amount too small for swap. Minimum amount required.');
      }
      if (errorData?.error?.includes('amount too large')) {
        throw new Error('Amount too large. Try reducing the swap amount.');
      }
      
      throw new Error('Invalid quote parameters. Please check token addresses and amount.');
    }
    if (err.response?.status === 404) {
      throw new Error('No route found for this token pair.');
    }
    if (err.code === 'ECONNABORTED') {
      throw new Error('Quote request timed out. Please try again.');
    }
    
    throw new Error(`Failed to get quote: ${err.message || 'Unknown error'}`);
  }
};

export const getReferralATA = async (
  outputMint: string,
  referralWallet: string
): Promise<string> => {
  const ata = await getAssociatedTokenAddress(
    new PublicKey(outputMint),
    new PublicKey(referralWallet),
    false
  );
  return ata.toBase58();
};

// --- 4. Build Swap Transaction ---
export const executeSwap = async (
  quote: QuoteResponse,
  userPublicKey: string,
  referralAccount?: string
): Promise<VersionedTransaction | Transaction> => {
  if (!quote || !quote.routePlan || quote.routePlan.length === 0) {
    throw new Error('Invalid quote: no route plan available');
  }

  // Use official Swap API v1 parameters from documentation
  const swapRequest: any = {
    quoteResponse: quote, 
    userPublicKey,
    wrapAndUnwrapSol: true,
    dynamicComputeUnitLimit: true,
    dynamicSlippage: true,
    prioritizationFeeLamports: {
      priorityLevelWithMaxLamports: {
        maxLamports: 1000000,
        priorityLevel: "veryHigh"
      }
    }
  };

  // --- Platform Fee Logic ---
  // Use pre-created ATA addresses from .env for feeAccount
  // Only set feeAccount and platformFeeBps if ATA exists for the inputMint
  let feeAccount: string | undefined;
  let platformFeeBps: number | undefined = 30; // You can change this value

  // Map inputMint to env variable
  if (quote.inputMint === 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v') { // USDC
    feeAccount = process.env.NEXT_PUBLIC_FEE_USDC;
  } else if (quote.inputMint === '94fzsMkuHAuFP4J8iMZS43euWr2CLtuvwLgyjPHyqcnY') { // MEME
    feeAccount = process.env.NEXT_PUBLIC_FEE_MEME;
  } else if (quote.inputMint === 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB') { // USDT
    feeAccount = process.env.NEXT_PUBLIC_FEE_USDT;
  } else if (quote.inputMint === 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm') { // WIF
    feeAccount = process.env.NEXT_PUBLIC_FEE_WIF;
  } else if (quote.inputMint === 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN') { // JUP
    feeAccount = process.env.NEXT_PUBLIC_FEE_JUP;
  } else if (quote.inputMint === 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263') { // BONK
    feeAccount = process.env.NEXT_PUBLIC_FEE_BONK;
  } else if (quote.inputMint === 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So') { // mSOL
    feeAccount = process.env.NEXT_PUBLIC_FEE_MSOL;
  } else if (quote.inputMint === 'So11111111111111111111111111111111111111112') { // WSOL
  feeAccount = process.env.NEXT_PUBLIC_FEE_WSOL;
}
  

  // Only set feeAccount if it exists and inputMint is not native SOL
  if (feeAccount) {
  swapRequest.feeAccount = feeAccount;
  swapRequest.platformFeeBps = platformFeeBps;
}

  console.log("Fee info:", {
    platformFeeBps: swapRequest.platformFeeBps,
    feeAccount: swapRequest.feeAccount
  });



  try {
    console.log('Building swap transaction with minimal request:', {
      inputMint: quote.inputMint,
      outputMint: quote.outputMint,
      inAmount: quote.inAmount,
      outAmount: quote.outAmount,
      userPublicKey,
      routePlanLength: quote.routePlan.length
    });
    
    const response = await axios.post(`${QUOTE_API_URL}/swap/v1/swap`, swapRequest, {
      timeout: 30000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    
    const swapResponse: SwapResponse = response.data;
    
    if (!swapResponse.swapTransaction) {
      throw new Error('No swap transaction returned from Jupiter');
    }
    
    // Deserialize the transaction based on type
    let transaction: VersionedTransaction | Transaction;
    
    if (swapRequest.asLegacyTransaction) {
      // For legacy transactions, deserialize as Transaction
      transaction = Transaction.from(
        Buffer.from(swapResponse.swapTransaction, 'base64')
      );
    } else {
      // For versioned transactions, deserialize as VersionedTransaction
      transaction = VersionedTransaction.deserialize(
        Buffer.from(swapResponse.swapTransaction, 'base64')
      );
    }
    
    console.log('Successfully built transaction:', {
      lastValidBlockHeight: swapResponse.lastValidBlockHeight,
      prioritizationFeeLamports: swapResponse.prioritizationFeeLamports,
      computeUnitLimit: swapResponse.computeUnitLimit
    });
    
    return transaction;
  } catch (err: any) {
    console.error('Jupiter swap execution error:', err);
    console.error('Full error response:', err.response?.data);
    
    if (err.response?.status === 400) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Invalid swap request parameters';
      console.error('Jupiter 400 error details:', err.response?.data);
      
      // More specific swap error handling
      if (errorMsg.includes('insufficient liquidity')) {
        throw new Error('Insufficient liquidity available. Try a smaller amount or different token pair.');
      }
      if (errorMsg.includes('slippage')) {
        throw new Error('Transaction would exceed slippage tolerance. Increase slippage or try again.');
      }
      if (errorMsg.includes('price impact')) {
        throw new Error('Price impact too high for this trade size. Consider reducing the amount.');
      }
      if (errorMsg.includes('market closed') || errorMsg.includes('trading halted')) {
        throw new Error('Trading temporarily unavailable for this token pair.');
      }
      if (errorMsg.includes('insufficient balance')) {
        throw new Error('Insufficient token balance for this swap.');
      }
      
      throw new Error(`Swap transaction build failed: ${errorMsg}`);
    }
    if (err.response?.status === 500) {
      throw new Error('Jupiter API server error. Please try again later.');
    }
    if (err.code === 'ECONNABORTED') {
      throw new Error('Swap transaction build timed out. Please try again.');
    }
    
    throw new Error(`Failed to build swap transaction: ${err.message || 'Unknown error'}`);
  }
};

// --- 5. Send Serialized Swap Transaction ---
export const sendTransaction = async (
  transaction: VersionedTransaction,
  connection: Connection
): Promise<string> => {
  try {
    const rawTx = transaction.serialize();
    return await connection.sendRawTransaction(rawTx, {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
      maxRetries: 3,
    });
  } catch (err) {
    console.error('Failed to send transaction:', err);
    throw err;
  }
};

// --- 6. Enhanced Error Handling ---
export const handleJupiterError = (error: any): string => {
  const message = error.message?.toLowerCase() || '';
  
  if (message.includes('slice') && message.includes('out of range')) {
    return 'Jupiter route calculation error. Try a different amount or token pair.';
  }
  if (message.includes('insufficient funds') || message.includes('insufficient balance')) {
    return 'Insufficient balance for this swap.';
  }
  if (message.includes('slippage') || message.includes('price impact')) {
    return 'Price impact too high. Try increasing slippage tolerance.';
  }
  if (message.includes('no route found')) {
    return 'No trading route available for this token pair.';
  }
  if (message.includes('timeout') || message.includes('timed out')) {
    return 'Request timed out. Please try again.';
  }
  if (message.includes('network') || message.includes('connection')) {
    return 'Network error. Please check your connection and try again.';
  }
  
  return error.message || 'Swap execution failed';
};

// --- 7. Quote Validation Helper ---
export const isValidQuote = (quote: QuoteResponse | null): boolean => {
  if (!quote) return false;
  
  return !!(
    quote.inputMint &&
    quote.outputMint &&
    quote.inAmount &&
    quote.outAmount &&
    quote.routePlan &&
    Array.isArray(quote.routePlan) &&
    quote.routePlan.length > 0
  );
};


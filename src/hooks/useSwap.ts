import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { executeSwap, handleJupiterError, isValidQuote } from '@/lib/jupiter';
import {
  Connection,
  PublicKey,
  Transaction,
  VersionedTransaction
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction
} from '@solana/spl-token';
import type { QuoteResponse } from '@/config/types';

const REFERRAL_WALLET = process.env.NEXT_PUBLIC_REFERRAL_ACCOUNT || '';

export function useSwap() {
  const { publicKey, signTransaction, connected } = useWallet();
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapError, setSwapError] = useState<string | null>(null);

  const ensureAtaExists = async ({
    connection,
    mint,
    owner,
    payer
  }: {
    connection: Connection;
    mint: PublicKey;
    owner: PublicKey;
    payer: PublicKey;
  }): Promise<Transaction | null> => {
    try {
      const ata = await getAssociatedTokenAddress(mint, owner);
      const info = await connection.getAccountInfo(ata);
      if (!info) {
        const tx = new Transaction().add(
          createAssociatedTokenAccountInstruction(payer, ata, owner, mint)
        );
        return tx;
      }
      return null;
    } catch (error) {
      console.error('Error checking/creating ATA:', error);
      return null;
    }
  };

  const getReferralFeeAccountIfExists = async (
    connection: Connection,
    outTokenMint: string,
    referralWallet: string
  ): Promise<string | undefined> => {
    try {
      const ata = await getAssociatedTokenAddress(
        new PublicKey(outTokenMint),
        new PublicKey(referralWallet)
      );
      const info = await connection.getAccountInfo(ata);
      return info ? ata.toBase58() : undefined;
    } catch (error) {
      console.error('Error checking referral ATA:', error);
      return undefined;
    }
  };

  const performSwap = async (
    quote: QuoteResponse,
    userPublicKey: string,
    _referralAccount: string, // ignored in favor of dynamic lookup
    connection: Connection
  ): Promise<string> => {
    if (!publicKey || !signTransaction || !connected) {
      throw new Error('Wallet not connected or ready');
    }

    if (!isValidQuote(quote)) {
      throw new Error('Invalid quote data - missing required fields');
    }

    setIsSwapping(true);
    setSwapError(null);

    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('Starting swap with quote:', {
          inputMint: quote.inputMint,
          outputMint: quote.outputMint,
          inAmount: quote.inAmount,
          outAmount: quote.outAmount,
          slippage: quote.slippageBps,
          routePlan: quote.routePlan?.length || 0
        });
      }

      const balance = await connection.getBalance(publicKey);
      if (process.env.NODE_ENV === 'development') {
        console.log('SOL balance:', balance / 1e9, 'SOL');
      }

      if (balance < 0.005 * 1e9) {
        throw new Error('Insufficient SOL balance for transaction fees (minimum 0.005 SOL required)');
      }

      // Create ATA for user if needed
      if (quote.outputMint !== 'So11111111111111111111111111111111111111112') {
        const ataTx = await ensureAtaExists({
          connection,
          mint: new PublicKey(quote.outputMint),
          owner: publicKey,
          payer: publicKey
        });

        if (ataTx) {
          if (process.env.NODE_ENV === 'development') {
            console.log('Creating missing ATA for output token...');
          }
          try {
            const ataSigned = await signTransaction(ataTx);
            const ataTxid = await connection.sendRawTransaction(
              ataSigned.serialize(),
              {
                skipPreflight: false,
                preflightCommitment: 'confirmed'
              }
            );
            await connection.confirmTransaction(ataTxid, 'confirmed');
            if (process.env.NODE_ENV === 'development') {
              console.log('ATA created successfully:', ataTxid);
            }
          } catch (ataError) {
            if (process.env.NODE_ENV === 'development') {
              console.warn('ATA creation failed, but continuing with swap:', ataError);
            }
          }
        }
      }

      // ✅ Get referral ATA if it exists
      const feeAccount = await getReferralFeeAccountIfExists(
        connection,
        quote.outputMint,
        REFERRAL_WALLET
      );

      if (process.env.NODE_ENV === 'development') {
        console.log('Building swap transaction...');
      }
      const swapTransaction = await executeSwap(quote, userPublicKey, feeAccount);

      // Get fresh blockhash
      const { blockhash } = await connection.getLatestBlockhash('confirmed');

      if (swapTransaction instanceof VersionedTransaction) {
        swapTransaction.message.recentBlockhash = blockhash;
      } else {
        (swapTransaction as Transaction).recentBlockhash = blockhash;
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('Signing and sending transaction...');
      }
      const signedTx = await signTransaction(swapTransaction);
      const txid = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'processed',
        maxRetries: 3
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('Transaction sent successfully! TXID:', txid);
      }
      return txid;

    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Swap failed:', error);
      }
      let userMessage = handleJupiterError(error);
      setSwapError(userMessage);
      throw new Error(userMessage);
    } finally {
      setIsSwapping(false);
    }
  };

  return { performSwap, isSwapping, swapError };
}

import { Connection, clusterApiUrl, TransactionResponse } from '@solana/web3.js';

const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');

/**
 * Fetch transaction details by transaction signature (txHash)
 * @param txHash Transaction signature string
 * @returns TransactionResponse or null if not found
 */
export async function fetchTransactionDetails(txHash: string): Promise<TransactionResponse | null> {
  try {
    const transaction = await connection.getTransaction(txHash, { commitment: 'confirmed' });
    return transaction;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching transaction details:', error);
    }
    return null;
  }
}

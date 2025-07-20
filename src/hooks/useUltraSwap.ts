// import { useState } from 'react';
// import { useWallet } from '@solana/wallet-adapter-react';
// import { 
//   getUltraOrder, 
//   executeUltraOrder, 
//   handleUltraError,
//   type UltraOrderResponse 
// } from '@/lib/jupiter-ultra';
// import { VersionedTransaction } from '@solana/web3.js';

// export function useUltraSwap() {
//   const { publicKey, signTransaction, connected } = useWallet();
//   const [isSwapping, setIsSwapping] = useState(false);
//   const [swapError, setSwapError] = useState<string | null>(null);

//   const performUltraSwap = async (
//     inputMint: string,
//     outputMint: string,
//     amount: string,
//     slippage: number,
//     referralAccount?: string
//   ): Promise<string> => {
//     if (!publicKey || !signTransaction || !connected) {
//       throw new Error('Wallet not connected or ready');
//     }

//     setIsSwapping(true);
//     setSwapError(null);

//     try {
//       console.log('Starting Ultra swap:', {
//         inputMint,
//         outputMint,
//         amount,
//         slippage,
//         userPublicKey: publicKey.toString()
//       });

//       // Step 1: Get Ultra Order
//       const ultraOrder = await getUltraOrder(
//         inputMint,
//         outputMint,
//         amount,
//         publicKey.toString(),
//         slippage,
//         referralAccount
//       );

//       console.log('Ultra order received:', {
//         orderType: ultraOrder.orderType,
//         estimatedOutput: ultraOrder.estimatedOutput,
//         estimatedSlippage: ultraOrder.estimatedSlippage
//       });

//       // Step 2: Deserialize and sign the transaction
//       const transaction = VersionedTransaction.deserialize(
//         Buffer.from(ultraOrder.order, 'base64')
//       );

//       console.log('Signing Ultra transaction...');
//       const signedTransaction = await signTransaction(transaction);

//       // Step 3: Execute the signed transaction via Ultra API
//       const signedTxBase64 = Buffer.from(signedTransaction.serialize()).toString('base64');
      
//       console.log('Executing Ultra order...');
//       const executeResult = await executeUltraOrder(signedTxBase64);

//       // Step 4: Handle execution result
//       if (executeResult.status === 'failed') {
//         throw new Error(executeResult.error || 'Ultra execution failed');
//       }

//       if (executeResult.status === 'pending') {
//         console.log('Ultra swap is pending...');
//         // You might want to poll for status here
//       }

//       if (executeResult.status === 'success' && executeResult.txid) {
//         console.log('Ultra swap successful! TXID:', executeResult.txid);
//         console.log('Execution time:', executeResult.executionTime, 'ms');
//         return executeResult.txid;
//       }

//       throw new Error('Ultra execution completed but no transaction ID received');

//     } catch (error: any) {
//       console.error('Ultra swap failed:', error);
      
//       const userMessage = handleUltraError(error);
//       setSwapError(userMessage);
//       throw new Error(userMessage);
//     } finally {
//       setIsSwapping(false);
//     }
//   };

//   return { 
//     performUltraSwap, 
//     isSwapping, 
//     swapError 
//   };
// }

// src/lib/utils.ts
// Convert to smallest unit (e.g., SOL -> lamports)
export const toSmallestUnit = (amount: number, decimals: number): bigint => {
  // Use string manipulation to avoid floating point inaccuracies
  const multiplier = BigInt(10 ** decimals);
  const amountString = amount.toString();
  const [integerPart, decimalPart] = amountString.split('.');

  let totalBigInt = BigInt(integerPart) * multiplier;

  if (decimalPart) {
    const paddedDecimalPart = (decimalPart + '0'.repeat(decimals)).substring(0, decimals);
    totalBigInt += BigInt(paddedDecimalPart);
  }

  return totalBigInt;
};

// Convert from smallest unit (e.g., lamports -> SOL)
export const fromSmallestUnit = (amount: bigint, decimals: number): number => {
  const divisor = BigInt(10 ** decimals);
  // Use string manipulation to preserve precision for large numbers
  const amountStr = amount.toString();
  const divisorStr = divisor.toString();
  
  if (amountStr.length <= divisorStr.length - 1) {
    // Amount is smaller than 1 unit, return decimal
    const paddedAmount = amountStr.padStart(decimals, '0');
    return parseFloat('0.' + paddedAmount);
  } else {
    // Amount is larger than 1 unit
    const integerPart = amountStr.slice(0, amountStr.length - decimals);
    const decimalPart = amountStr.slice(amountStr.length - decimals);
    
    if (decimalPart === '0'.repeat(decimals)) {
      return parseFloat(integerPart);
    } else {
      return parseFloat(integerPart + '.' + decimalPart.replace(/0+$/, ''));
    }
  }
};

// Format number with commas
export const formatNumber = (num: number, decimals = 6): string => {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
};
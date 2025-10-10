// 🔒 SECURITY: Comprehensive input validation schemas using Zod
import { z } from 'zod';

// Solana address validation regex
const SOLANA_ADDRESS_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

// Base validation schemas
export const SolanaAddressSchema = z.string()
  .regex(SOLANA_ADDRESS_REGEX, 'Invalid Solana address format')
  .min(32)
  .max(44);

export const AmountSchema = z.string()
  .regex(/^\d+(\.\d+)?$/, 'Amount must be a valid decimal number')
  .refine((val) => parseFloat(val) > 0, 'Amount must be greater than 0')
  .refine((val) => parseFloat(val) <= 1000000000, 'Amount exceeds maximum limit');

export const SlippageSchema = z.number()
  .min(0.1, 'Slippage must be at least 0.1%')
  .max(50, 'Slippage cannot exceed 50%');

export const TokenSymbolSchema = z.string()
  .min(1, 'Token symbol is required')
  .max(10, 'Token symbol too long')
  .regex(/^[A-Z0-9]+$/, 'Token symbol must be uppercase alphanumeric');

// API input validation schemas
export const QuoteRequestSchema = z.object({
  inputMint: SolanaAddressSchema,
  outputMint: SolanaAddressSchema,
  amount: AmountSchema,
  slippage: SlippageSchema,
  referralAccount: SolanaAddressSchema.optional()
});

export const SwapRequestSchema = z.object({
  walletAddress: SolanaAddressSchema,
  fromToken: TokenSymbolSchema,
  toToken: TokenSymbolSchema,
  fromAmount: z.number().positive(),
  toAmount: z.number().positive(),
  signature: z.string().min(64).max(128),
  slippage: SlippageSchema
});

export const UserSettingsSchema = z.object({
  slippage: SlippageSchema.optional(),
  priorityFee: z.number().min(0).max(0.01).optional(),
  theme: z.enum(['dark', 'light']).optional(),
  notifications: z.boolean().optional()
});

// Wallet connection validation
export const WalletConnectionSchema = z.object({
  publicKey: SolanaAddressSchema,
  connected: z.boolean(),
  adapter: z.string().min(1).max(50)
});

// Transaction hash validation
export const TransactionHashSchema = z.string()
  .regex(/^[1-9A-HJ-NP-Za-km-z]{64,88}$/, 'Invalid transaction hash format');

// Email validation for waitlist/notifications
export const EmailSchema = z.string()
  .email('Invalid email format')
  .max(255, 'Email too long');

// Search query validation
export const SearchQuerySchema = z.string()
  .min(1, 'Search query cannot be empty')
  .max(100, 'Search query too long')
  .regex(/^[a-zA-Z0-9\s\-_\.]+$/, 'Search query contains invalid characters');

// Rate limiting schemas
export const RateLimitSchema = z.object({
  windowMs: z.number().positive(),
  maxRequests: z.number().positive(),
  identifier: z.string().min(1).max(100)
});

// File upload validation (for profile pictures, etc.)
export const FileUploadSchema = z.object({
  name: z.string().max(255),
  size: z.number().max(5 * 1024 * 1024), // 5MB max
  type: z.enum(['image/jpeg', 'image/png', 'image/webp'])
});

// API response validation
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  timestamp: z.number().optional()
});

// Pagination validation
export const PaginationSchema = z.object({
  page: z.number().min(1).max(1000),
  limit: z.number().min(1).max(100),
  sort: z.enum(['asc', 'desc']).optional(),
  sortBy: z.string().max(50).optional()
});

// Date range validation
export const DateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate);
  }
  return true;
}, 'End date must be after start date');

// Comprehensive swap logging schema
export const SwapLogSchema = z.object({
  walletAddress: SolanaAddressSchema,
  fromToken: TokenSymbolSchema,
  toToken: TokenSymbolSchema,
  fromAmount: z.number().positive(),
  toAmount: z.number().positive(),
  fromUsdValue: z.number().min(0).optional(),
  toUsdValue: z.number().min(0).optional(),
  feesPaid: z.number().min(0),
  feesUsdValue: z.number().min(0).optional(),
  signature: TransactionHashSchema,
  blockTime: z.number().positive(),
  slippage: z.number().min(0).max(1),
  routePlan: z.string().optional(),
  jupiterFee: z.number().min(0).optional(),
  platformFee: z.number().min(0).optional(),
  memeBurned: z.number().min(0).optional(),
  fee_token_symbol: TokenSymbolSchema.optional(),
  fee_token_mint: SolanaAddressSchema.optional()
});

// Helper function to validate and sanitize input
export function validateInput<T>(schema: z.ZodSchema<T>, input: unknown): T {
  try {
    return schema.parse(input);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join(', ');
      throw new Error(`Validation failed: ${errorMessages}`);
    }
    throw error;
  }
}

// Middleware validation helper
export function createValidationMiddleware<T>(schema: z.ZodSchema<T>) {
  return (input: unknown): T => {
    return validateInput(schema, input);
  };
}

// Type exports for TypeScript support
export type QuoteRequest = z.infer<typeof QuoteRequestSchema>;
export type SwapRequest = z.infer<typeof SwapRequestSchema>;
export type UserSettings = z.infer<typeof UserSettingsSchema>;
export type WalletConnection = z.infer<typeof WalletConnectionSchema>;
export type SwapLog = z.infer<typeof SwapLogSchema>;
export type SearchQuery = z.infer<typeof SearchQuerySchema>;
export type Pagination = z.infer<typeof PaginationSchema>;
export type DateRange = z.infer<typeof DateRangeSchema>;
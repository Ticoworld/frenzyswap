// src/lib/auth.ts
import { NextRequest } from 'next/server';
import crypto from 'crypto';

// Get secret from environment variable
const AUTH_SECRET = process.env.AUTH_SECRET || crypto.randomBytes(32).toString('hex');

// Admin wallets from environment
const getAdminWallets = (): string[] => {
  const adminWallets = process.env.NEXT_PUBLIC_ADMIN_WALLETS;
  if (!adminWallets) return [];
  return adminWallets.split(',').map(wallet => wallet.trim().toLowerCase());
};

// Whitelisted wallets for beta access
const getWhitelistedWallets = (): string[] => {
  const allowedWallets = process.env.NEXT_PUBLIC_ALLOWED_WALLETS;
  if (!allowedWallets) return [];
  return allowedWallets.split(',').map(wallet => wallet.trim().toLowerCase());
};

export interface AuthToken {
  walletAddress: string;
  isAdmin: boolean;
  isWhitelisted: boolean;
  exp: number;
}

// Simple token generation using crypto
export function generateAuthToken(walletAddress: string): string {
  const adminWallets = getAdminWallets();
  const whitelistedWallets = getWhitelistedWallets();
  
  const normalizedWallet = walletAddress.toLowerCase();
  const isAdmin = adminWallets.includes(normalizedWallet);
  const isWhitelisted = whitelistedWallets.includes(normalizedWallet) || isAdmin;

  const tokenData: AuthToken = {
    walletAddress: normalizedWallet,
    isAdmin,
    isWhitelisted,
    exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  };

  // Create a signed token
  const payload = JSON.stringify(tokenData);
  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(payload)
    .digest('hex');

  return Buffer.from(`${payload}.${signature}`).toString('base64');
}

// Verify token
export function verifyAuthToken(token: string): AuthToken | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [payload, signature] = decoded.split('.');
    
    if (!payload || !signature) return null;

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', AUTH_SECRET)
      .update(payload)
      .digest('hex');

    if (signature !== expectedSignature) return null;

    const tokenData = JSON.parse(payload) as AuthToken;
    
    // Check expiration
    if (tokenData.exp < Date.now()) return null;

    return tokenData;
  } catch (error) {
    return null;
  }
}

// Extract and verify auth token from request
export function getAuthFromRequest(request: NextRequest): AuthToken | null {
  // Check Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return verifyAuthToken(token);
  }

  // Check cookie as fallback
  const tokenCookie = request.cookies.get('auth-token');
  if (tokenCookie?.value) {
    return verifyAuthToken(tokenCookie.value);
  }

  return null;
}

// Middleware to check if user is authenticated
export function requireAuth(request: NextRequest): AuthToken | Response {
  const auth = getAuthFromRequest(request);
  
  if (!auth) {
    return new Response(
      JSON.stringify({ error: 'Authentication required' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return auth;
}

// Middleware to check if user is admin
export function requireAdmin(request: NextRequest): AuthToken | Response {
  const auth = getAuthFromRequest(request);
  
  if (!auth) {
    return new Response(
      JSON.stringify({ error: 'Authentication required' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!auth.isAdmin) {
    return new Response(
      JSON.stringify({ error: 'Admin access required' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return auth;
}

// Middleware to check if user is whitelisted
export function requireWhitelisted(request: NextRequest): AuthToken | Response {
  const auth = getAuthFromRequest(request);
  
  if (!auth) {
    return new Response(
      JSON.stringify({ error: 'Authentication required' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!auth.isWhitelisted) {
    return new Response(
      JSON.stringify({ error: 'Beta access required' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return auth;
}

// Rate limiting helper
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000 // 1 minute
): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(identifier);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    });
    return true;
  }

  if (userLimit.count >= maxRequests) {
    return false;
  }

  userLimit.count++;
  return true;
}

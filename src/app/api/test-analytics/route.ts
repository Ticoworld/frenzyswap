// src/app/api/test-analytics/route.ts
import { NextResponse } from 'next/server';
import { isAnalyticsEnabled } from '@/lib/supabase';

export async function POST() {
  try {
    // Check if analytics is enabled
    if (!isAnalyticsEnabled()) {
      return NextResponse.json({
        success: false,
        error: 'Analytics system not configured yet',
        message: 'Supabase environment variables are not set. This is a Phase 2 feature.',
        instructions: 'Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable analytics.'
      });
    }
    // Test logging a sample swap
    const testSwap = {
      walletAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      fromToken: 'SOL',
      toToken: 'USDC',
      fromAmount: 1.5,
      toAmount: 150.25,
      fromUsdValue: 150.0,
      toUsdValue: 150.25,
      feesPaid: 0.05,
      feesUsdValue: 5.0,
      signature: 'test_signature_' + Date.now(),
      blockTime: Math.floor(Date.now() / 1000),
      jupiterFee: 0.03,
      platformFee: 0.02,
      memeBurned: 10.5,
      slippage: 0.005,
      routePlan: JSON.stringify({ route: 'direct', markets: ['serum'] })
    };

    const logResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/log-swap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testSwap),
    });

    const logResult = await logResponse.json();

    // Test fetching stats
    const statsResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/stats`);
    const statsResult = await statsResponse.json();

    return NextResponse.json({
      success: true,
      logResponse: {
        status: logResponse.status,
        data: logResult
      },
      statsResponse: {
        status: statsResponse.status,
        data: statsResult
      }
    });

  } catch (error) {
    console.error('Analytics test failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

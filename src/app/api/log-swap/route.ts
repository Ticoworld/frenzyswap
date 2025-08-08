// src/app/api/log-swap/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase, isAnalyticsEnabled } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Check if analytics is enabled (Phase 2 feature)
    if (!isAnalyticsEnabled()) {
      console.log('Analytics not configured - skipping swap logging')
      return NextResponse.json({ 
        success: true, 
        message: 'Analytics not configured yet' 
      })
    }

    const body = await request.json()
    // Debug: log incoming analytics payload
    console.log('[log-swap] Incoming body:', JSON.stringify(body));
    const {
      walletAddress,
      fromToken,
      toToken,
      fromAmount,
      toAmount,
      fromUsdValue,
      toUsdValue,
      feesPaid,
      feesUsdValue,
      signature,
      blockTime,
      jupiterFee,
      platformFee,
      memeBurned,
      slippage,
      routePlan,
      fee_token_symbol,
      fee_token_mint
    } = body

    // Validate required fields
    if (!walletAddress || !fromToken || !toToken || !signature) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Prepare swap record to match database schema
    const swapRecord = {
      wallet_address: walletAddress,
      from_token: fromToken,
      to_token: toToken,
      from_amount: parseFloat(fromAmount) || 0,
      to_amount: parseFloat(toAmount) || 0,
      from_usd_value: parseFloat(fromUsdValue) || null,
      to_usd_value: parseFloat(toUsdValue) || null,
      fees_paid: parseFloat(feesPaid) || null,
      fees_usd_value: parseFloat(feesUsdValue) || null,
      signature: signature,
      block_time: blockTime ? parseInt(blockTime) : null,
      jupiter_fee: parseFloat(jupiterFee) || null,
      platform_fee: parseFloat(platformFee) || null,
      meme_burned: parseFloat(memeBurned) || null,
      slippage: parseFloat(slippage) || null,
      route_plan: routePlan || null,
      fee_token_symbol: fee_token_symbol || null,
      fee_token_mint: fee_token_mint || null
    }

    // Insert into Supabase
    const { data, error } = await supabase!
      .from('swap_records')
      .insert([swapRecord])
      .select()

    if (error) {
      // Handle duplicate signature errors gracefully
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { success: true, message: 'Swap already logged' },
          { status: 200 }
        )
      }
      
      console.error('Supabase insert error:', error)
      return NextResponse.json(
        { error: 'Failed to log swap' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      data: data[0] 
    })

  } catch (error) {
    console.error('Log swap API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
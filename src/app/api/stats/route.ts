// src/app/api/stats/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase, isAnalyticsEnabled } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Check if analytics is enabled (Phase 2 feature)
    if (!isAnalyticsEnabled()) {
      // Return demo/placeholder stats when analytics isn't configured yet
      return NextResponse.json({
        totalVolume: "$0",
        totalSwaps: "0",
        totalEarnings: "$0",
        memeBurned: "0 MEME",
        uniqueWallets: "0",
        lastUpdated: new Date().toISOString(),
        status: "analytics_not_configured"
      })
    }
    // First, try to get cached stats
    const { data: cachedStats, error: statsError } = await supabase!
      .from('platform_stats')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (cachedStats && !statsError) {
      // Check if stats are recent (less than 1 hour old)
      const lastUpdated = new Date(cachedStats.last_updated)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
      
      if (lastUpdated > oneHourAgo) {
        return NextResponse.json({
          totalVolume: `$${Number(cachedStats.total_volume_usd).toLocaleString()}`,
          totalSwaps: Number(cachedStats.total_swaps).toLocaleString(),
          totalEarnings: `$${Number(cachedStats.total_earnings_usd).toLocaleString()}`,
          memeBurned: `${Number(cachedStats.total_meme_burned).toLocaleString()} MEME`,
          uniqueWallets: Number(cachedStats.unique_wallets).toLocaleString(),
          lastUpdated: cachedStats.last_updated
        })
      }
    }

    // If no cached stats or they're stale, calculate fresh stats
    const { data: swaps, error } = await supabase!
      .from('swap_records')
      .select('from_usd_value, fees_usd_value, meme_burned, wallet_address')

    if (error) {
      console.error('Failed to fetch swap records:', error)
      // Return fallback stats
      return NextResponse.json({
        totalVolume: "$0",
        totalSwaps: "0",
        totalEarnings: "$0",
        memeBurned: "0 MEME",
        uniqueWallets: "0",
        lastUpdated: new Date().toISOString()
      })
    }

    if (!swaps || swaps.length === 0) {
      return NextResponse.json({
        totalVolume: "$0",
        totalSwaps: "0",
        totalEarnings: "$0",
        memeBurned: "0 MEME",
        uniqueWallets: "0",
        lastUpdated: new Date().toISOString()
      })
    }

    // Calculate fresh stats
    const totalSwaps = swaps.length
    const totalVolumeUsd = swaps.reduce((sum, swap) => sum + (Number(swap.from_usd_value) || 0), 0)
    const totalPlatformEarnings = swaps.reduce((sum, swap) => sum + (Number(swap.fees_usd_value) || 0), 0)
    const totalMemeBurned = swaps.reduce((sum, swap) => sum + (Number(swap.meme_burned) || 0), 0)
    const uniqueWallets = new Set(swaps.map(swap => swap.wallet_address)).size

    const stats = {
      totalVolume: `$${totalVolumeUsd.toLocaleString()}`,
      totalSwaps: totalSwaps.toLocaleString(),
      totalEarnings: `$${totalPlatformEarnings.toLocaleString()}`,
      memeBurned: `${totalMemeBurned.toLocaleString()} MEME`,
      uniqueWallets: uniqueWallets.toLocaleString(),
      lastUpdated: new Date().toISOString()
    }

    // Update cached stats in background (without await to avoid blocking response)
    const updateStats = async () => {
      try {
        await supabase!
          .from('platform_stats')
          .upsert({
            total_swaps: totalSwaps,
            total_volume_usd: totalVolumeUsd,
            total_earnings_usd: totalPlatformEarnings,
            total_meme_burned: totalMemeBurned,
            unique_wallets: uniqueWallets,
            last_updated: new Date().toISOString()
          })
      } catch (error) {
        console.error('Failed to update cached stats:', error)
      }
    }
    updateStats()

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Stats API error:', error)
    
    // Return fallback stats on error
    return NextResponse.json({
      totalVolume: "$0",
      totalSwaps: "0", 
      totalEarnings: "$0",
      memeBurned: "0 MEME",
      uniqueWallets: "0",
      lastUpdated: new Date().toISOString()
    })
  }
}

// Optional: GET specific timeframe stats
export async function POST(request: NextRequest) {
  try {
    // Check if analytics is enabled
    if (!isAnalyticsEnabled()) {
      return NextResponse.json({ 
        error: 'Analytics not configured yet' 
      }, { status: 503 })
    }

    const { timeframe } = await request.json()
    
    let dateFilter = new Date()
    switch (timeframe) {
      case '24h':
        dateFilter.setDate(dateFilter.getDate() - 1)
        break
      case '7d':
        dateFilter.setDate(dateFilter.getDate() - 7)
        break
      case '30d':
        dateFilter.setDate(dateFilter.getDate() - 30)
        break
      default:
        dateFilter = new Date(0) // All time
    }

    const { data: swaps, error } = await supabase!
      .from('swap_records')
      .select('from_usd_value, fees_usd_value, meme_burned, wallet_address, created_at')
      .gte('created_at', dateFilter.toISOString())

    if (error || !swaps) {
      return NextResponse.json({ error: 'Failed to fetch timeframe stats' }, { status: 500 })
    }

    const totalSwaps = swaps.length
    const totalVolumeUsd = swaps.reduce((sum, swap) => sum + (Number(swap.from_usd_value) || 0), 0)
    const totalPlatformEarnings = swaps.reduce((sum, swap) => sum + (Number(swap.fees_usd_value) || 0), 0)
    const totalMemeBurned = swaps.reduce((sum, swap) => sum + (Number(swap.meme_burned) || 0), 0)
    const uniqueWallets = new Set(swaps.map(swap => swap.wallet_address)).size

    return NextResponse.json({
      timeframe,
      totalVolume: `$${totalVolumeUsd.toLocaleString()}`,
      totalSwaps: totalSwaps.toLocaleString(),
      totalEarnings: `$${totalPlatformEarnings.toLocaleString()}`,
      memeBurned: `${totalMemeBurned.toLocaleString()} MEME`,
      uniqueWallets: uniqueWallets.toLocaleString(),
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error('Timeframe stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

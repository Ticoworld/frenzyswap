// src/app/api/swaps/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase, isAnalyticsEnabled } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Check if analytics is enabled
    if (!isAnalyticsEnabled()) {
      return NextResponse.json({
        records: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 1,
        message: 'Analytics not configured yet'
      });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Get total count
    const { count, error: countError } = await supabase!
      .from('swap_records')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error getting swap count:', countError);
      return NextResponse.json(
        { error: 'Failed to fetch swap count' },
        { status: 500 }
      );
    }

    // Get paginated records
    const { data: records, error: recordsError } = await supabase!
      .from('swap_records')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (recordsError) {
      console.error('Error fetching swap records:', recordsError);
      return NextResponse.json(
        { error: 'Failed to fetch swap records' },
        { status: 500 }
      );
    }

    // Enhance records with from_token_mint and to_token_mint
    const enhancedRecords = (records || []).map((rec) => {
      let from_token_mint, to_token_mint;
      try {
        if (rec.route_plan) {
          const plan = typeof rec.route_plan === 'string' ? JSON.parse(rec.route_plan) : rec.route_plan;
          if (Array.isArray(plan) && plan.length > 0) {
            from_token_mint = plan[0]?.swapInfo?.inputMint;
            to_token_mint = plan[plan.length - 1]?.swapInfo?.outputMint;
          }
        }
      } catch (e) {
        // ignore parse errors
      }
      return {
        ...rec,
        from_token_mint,
        to_token_mint,
      };
    });
    return NextResponse.json({
      records: enhancedRecords,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    });

  } catch (error) {
    console.error('Error in /api/swaps:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
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

    return NextResponse.json({
      records: records || [],
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

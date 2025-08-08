// src/app/api/token-prices/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { mints } = await request.json();
    if (!Array.isArray(mints) || mints.length === 0) {
      return NextResponse.json({ error: 'No mints provided' }, { status: 400 });
    }
    const url = `https://public-api.birdeye.so/defi/multi_price?list_address=${mints.join(',')}&ui_amount_mode=raw`;
    const res = await fetch(url, {
      headers: {
        'X-API-KEY': process.env.BIRDEYE_API_KEY || '',
        'x-chain': 'solana',
        'accept': 'application/json',
      },
    });
    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: 'Failed to fetch token prices', details: err }, { status: res.status });
    }
    const data = await res.json();
    // Type for Birdeye multi_price response
    type BirdeyeMultiPrice = {
      data: {
        [mint: string]: { value: number } | undefined;
      };
    };
    const birdeyeData = data as BirdeyeMultiPrice;
    const prices: Record<string, number | null> = {};
    for (const mint of mints) {
      prices[mint] = birdeyeData.data && birdeyeData.data[mint] && typeof birdeyeData.data[mint]?.value === 'number' ? birdeyeData.data[mint]!.value : null;
    }
    return NextResponse.json({ prices });
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error', details: String(e) }, { status: 500 });
  }
}

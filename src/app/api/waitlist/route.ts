// src/app/api/waitlist/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, WaitlistEntry } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

// Join waitlist
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, email, source } = body;

    // Validate required fields
    if (!walletAddress || !source) {
      return NextResponse.json(
        { error: 'Wallet address and source are required' },
        { status: 400 }
      );
    }

    // Validate wallet address format (basic Solana address validation)
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(walletAddress)) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    // Validate source
    if (!['denied_access', 'landing_page'].includes(source)) {
      return NextResponse.json(
        { error: 'Invalid source. Must be "denied_access" or "landing_page"' },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const waitlistCollection = db.collection<WaitlistEntry>('waitlist');

    // Check if wallet already exists
    const existingEntry = await waitlistCollection.findOne({ walletAddress });
    if (existingEntry) {
      return NextResponse.json(
        { 
          message: 'Wallet already on waitlist',
          joinedAt: existingEntry.joinedAt,
          position: await getWaitlistPosition(waitlistCollection, walletAddress)
        },
        { status: 200 }
      );
    }

    // Create waitlist entry
    const waitlistEntry: WaitlistEntry = {
      walletAddress,
      email: email || undefined,
      joinedAt: new Date(),
      source: source as 'denied_access' | 'landing_page',
      notified: false
    };

    const result = await waitlistCollection.insertOne(waitlistEntry);
    
    if (result.insertedId) {
      const position = await getWaitlistPosition(waitlistCollection, walletAddress);
      
      console.log(`[Waitlist] ✅ Added ${walletAddress} (source: ${source}, position: ${position})`);
      
      return NextResponse.json({
        success: true,
        message: 'Successfully joined the waitlist!',
        joinedAt: waitlistEntry.joinedAt,
        position
      }, { status: 201 });
    } else {
      throw new Error('Failed to insert waitlist entry');
    }

  } catch (error) {
    console.error('[Waitlist] Error adding to waitlist:', error);
    return NextResponse.json(
      { error: 'Failed to join waitlist. Please try again.' },
      { status: 500 }
    );
  }
}

// Check waitlist status
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const walletAddress = url.searchParams.get('wallet');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const waitlistCollection = db.collection<WaitlistEntry>('waitlist');

    const entry = await waitlistCollection.findOne({ walletAddress });
    
    if (!entry) {
      return NextResponse.json(
        { onWaitlist: false },
        { status: 200 }
      );
    }

    const position = await getWaitlistPosition(waitlistCollection, walletAddress);
    
    return NextResponse.json({
      onWaitlist: true,
      joinedAt: entry.joinedAt,
      source: entry.source,
      position,
      email: entry.email ? '***@***' : undefined // Hide email for privacy
    }, { status: 200 });

  } catch (error) {
    console.error('[Waitlist] Error checking status:', error);
    return NextResponse.json(
      { error: 'Failed to check waitlist status' },
      { status: 500 }
    );
  }
}

// Helper function to get waitlist position
async function getWaitlistPosition(collection: any, walletAddress: string): Promise<number> {
  const entry = await collection.findOne({ walletAddress });
  if (!entry) return -1;
  
  const earlierEntries = await collection.countDocuments({
    joinedAt: { $lt: entry.joinedAt }
  });
  
  return earlierEntries + 1;
}

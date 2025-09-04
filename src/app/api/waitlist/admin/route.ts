// src/app/api/waitlist/admin/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  // Check admin authentication
  const authResult = requireAdmin(request);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const db = await getDatabase();
    const collection = db.collection('waitlist');

    // Fetch all entries sorted by joinedAt (earliest first)
    const entries = await collection
      .find({})
      .sort({ joinedAt: 1 })
      .toArray();

    // Add position numbers
    const entriesWithPosition = entries.map((entry, index) => ({
      ...entry,
      position: index + 1,
      _id: entry._id.toString() // Convert ObjectId to string for JSON serialization
    }));

    return NextResponse.json({
      success: true,
      entries: entriesWithPosition,
      requestedBy: authResult.walletAddress // Log who accessed this
    });
  } catch (error) {
    console.error('Failed to fetch waitlist entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch waitlist entries' },
      { status: 500 }
    );
  }
}

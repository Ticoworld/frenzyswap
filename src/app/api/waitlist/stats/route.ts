// src/app/api/waitlist/stats/route.ts
import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = await getDatabase();
    const waitlistCollection = db.collection('waitlist');

    const totalCount = await waitlistCollection.countDocuments();
    const deniedAccessCount = await waitlistCollection.countDocuments({ source: 'denied_access' });
    const landingPageCount = await waitlistCollection.countDocuments({ source: 'landing_page' });
    const withEmailCount = await waitlistCollection.countDocuments({ email: { $exists: true, $ne: null } });

    return NextResponse.json({
      total: totalCount,
      sources: {
        denied_access: deniedAccessCount,
        landing_page: landingPageCount
      },
      withEmail: withEmailCount,
      withoutEmail: totalCount - withEmailCount
    });

  } catch (error) {
    console.error('[Waitlist Stats] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get waitlist stats' },
      { status: 500 }
    );
  }
}

// API route: /api/auth/check
// Handles GET - check if admin is authenticated

import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// ─── GET /api/auth/check ───
// Verify admin session is valid
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('admin_session')?.value;

    if (!sessionId) {
      return NextResponse.json({ authenticated: false });
    }

    // Verify the session ID exists in the database
    const admin = await db.admin.findUnique({
      where: { id: sessionId },
    });

    if (!admin) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({
      authenticated: true,
      admin: { id: admin.id, username: admin.username },
    });
  } catch (error) {
    console.error('Error checking auth:', error);
    return NextResponse.json({ authenticated: false });
  }
}

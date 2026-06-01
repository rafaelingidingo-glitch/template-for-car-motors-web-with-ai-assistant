// API route: /api/auth/logout
// Handles POST - admin logout (clear session cookie)

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// ─── POST /api/auth/logout ───
// Clear the admin session cookie
export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('admin_session');

    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error during logout:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}

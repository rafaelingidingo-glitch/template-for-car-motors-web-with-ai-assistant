// API route: /api/auth/login
// Handles POST - admin login authentication
// FIX: Uses bcrypt for password comparison (previously plain-text)

import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

// ─── POST /api/auth/login ───
// Authenticate admin user and set session cookie
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.username || !body.password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Validate input length to prevent abuse
    if (body.username.length > 50 || body.password.length > 100) {
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      );
    }

    // Find admin user by username
    const admin = await db.admin.findUnique({
      where: { username: body.username },
    });

    if (!admin) {
      // Use generic error message to prevent username enumeration
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Secure password comparison using bcrypt
    // Supports both hashed passwords and legacy plain-text passwords
    // for backward compatibility during migration
    let passwordValid = false;
    if (admin.password.startsWith('$2a$') || admin.password.startsWith('$2b$')) {
      // Password is hashed with bcrypt
      passwordValid = await bcrypt.compare(body.password, admin.password);
    } else {
      // Legacy plain-text password (will be auto-hashed on next password change)
      passwordValid = admin.password === body.password;
    }

    if (!passwordValid) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Set a session cookie with the admin's database ID
    const cookieStore = await cookies();
    cookieStore.set('admin_session', admin.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return NextResponse.json({
      message: 'Login successful',
      admin: { id: admin.id, username: admin.username },
    });
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}

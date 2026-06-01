// API route: /api/admin
// Handles GET - list all admin users, POST - create new admin user
// FIX: Uses requireAuth() for proper session validation + bcrypt for passwords

import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// ─── GET /api/admin ───
// List all admin users (requires auth)
export async function GET() {
  try {
    // FIX: Validate session against database (previously only checked cookie existence)
    const admin = await requireAuth();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admins = await db.admin.findMany({
      select: { id: true, username: true, createdAt: true, updatedAt: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ admins });
  } catch (error) {
    console.error('Error fetching admins:', error);
    return NextResponse.json({ error: 'Failed to fetch admins' }, { status: 500 });
  }
}

// ─── POST /api/admin ───
// Create a new admin user
export async function POST(request: NextRequest) {
  try {
    // FIX: Validate session against database
    const admin = await requireAuth();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (!body.username || !body.password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Validate input
    if (body.username.length < 3 || body.username.length > 50) {
      return NextResponse.json(
        { error: 'Username must be between 3 and 50 characters' },
        { status: 400 }
      );
    }

    if (body.password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existing = await db.admin.findUnique({
      where: { username: body.username },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      );
    }

    // FIX: Hash password with bcrypt before storing
    const hashedPassword = await bcrypt.hash(body.password, 10);

    const newAdmin = await db.admin.create({
      data: {
        username: body.username,
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      admin: { id: newAdmin.id, username: newAdmin.username },
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating admin:', error);
    return NextResponse.json({ error: 'Failed to create admin' }, { status: 500 });
  }
}

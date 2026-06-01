// API route: /api/settings
// Handles GET (fetch settings) and PUT (update settings)
// FIX: Uses requireAuth() for proper session validation on PUT

import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { invalidateChatCache } from '@/lib/chat-cache';

// Shared default settings (single source of truth)
const DEFAULT_SETTINGS = {
  shopName: 'AutoElite Motors',
  phone: '+255 757 337 929',
  email: 'info@autoelite.co.tz',
  address: '123 Safari Drive, Dar es Salaam, Tanzania',
  location: '-6.7924,39.2083',
  hours: 'Mon-Fri: 8AM-6PM | Sat: 9AM-4PM | Sun: Closed',
  whatsapp: '255757337929',
  logo: '/images/logo.png',
};

// ─── GET /api/settings ───
// Fetch global site settings (public — creates default if none exist)
export async function GET() {
  try {
    let settings = await db.siteSetting.findFirst();

    if (!settings) {
      settings = await db.siteSetting.create({ data: DEFAULT_SETTINGS });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// ─── PUT /api/settings ───
// Update global site settings (requires authentication)
export async function PUT(request: NextRequest) {
  try {
    // FIX: Validate session against database
    const admin = await requireAuth();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    let settings = await db.siteSetting.findFirst();

    if (!settings) {
      settings = await db.siteSetting.create({
        data: {
          shopName: body.shopName || DEFAULT_SETTINGS.shopName,
          logo: body.logo || DEFAULT_SETTINGS.logo,
          phone: body.phone || DEFAULT_SETTINGS.phone,
          email: body.email || DEFAULT_SETTINGS.email,
          address: body.address || DEFAULT_SETTINGS.address,
          location: body.location || DEFAULT_SETTINGS.location,
          hours: body.hours || DEFAULT_SETTINGS.hours,
          whatsapp: body.whatsapp || DEFAULT_SETTINGS.whatsapp,
        },
      });
    } else {
      const updateData: Record<string, unknown> = {};
      if (body.shopName !== undefined) updateData.shopName = body.shopName;
      if (body.logo !== undefined) updateData.logo = body.logo;
      if (body.phone !== undefined) updateData.phone = body.phone;
      if (body.email !== undefined) updateData.email = body.email;
      if (body.address !== undefined) updateData.address = body.address;
      if (body.location !== undefined) updateData.location = body.location;
      if (body.hours !== undefined) updateData.hours = body.hours;
      if (body.whatsapp !== undefined) updateData.whatsapp = body.whatsapp;

      settings = await db.siteSetting.update({
        where: { id: settings.id },
        data: updateData,
      });

      // Invalidate AI chat cache so it picks up the updated settings
      invalidateChatCache();
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

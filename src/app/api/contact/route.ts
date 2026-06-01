// API route: /api/contact
// Handles POST - submit contact form message

import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// ─── POST /api/contact ───
// Save a new contact message from the website form
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Create the contact message in the database
    const message = await db.contactMessage.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone || null,
        message: body.message,
      },
    });

    return NextResponse.json(
      { message: 'Message sent successfully', id: message.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving contact message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

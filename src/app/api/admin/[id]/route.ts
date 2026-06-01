// API route: /api/admin/[id]
// Handles PUT - update admin username/password, DELETE - remove admin user
// FIX: Uses requireAuth() for proper session validation + bcrypt for passwords

import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// ─── PUT /api/admin/[id] ───
// Update admin username or password
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // FIX: Validate session against database
    const currentAdmin = await requireAuth();
    if (!currentAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Verify the admin exists
    const admin = await db.admin.findUnique({ where: { id } });
    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    // If changing password, require current password verification
    if (body.newPassword) {
      // SECURITY: Admins can only change their own password
      if (id !== currentAdmin.id) {
        return NextResponse.json(
          { error: 'You can only change your own password' },
          { status: 403 }
        );
      }
      if (!body.currentPassword) {
        return NextResponse.json(
          { error: 'Current password is required to change password' },
          { status: 400 }
        );
      }

      // Verify current password (supports both bcrypt and legacy plain-text)
      let currentPasswordValid = false;
      if (admin.password.startsWith('$2a$') || admin.password.startsWith('$2b$')) {
        currentPasswordValid = await bcrypt.compare(body.currentPassword, admin.password);
      } else {
        // Legacy plain-text comparison for backward compatibility
        currentPasswordValid = admin.password === body.currentPassword;
      }

      if (!currentPasswordValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 401 }
        );
      }
      if (body.newPassword.length < 6) {
        return NextResponse.json(
          { error: 'New password must be at least 6 characters' },
          { status: 400 }
        );
      }
    }

    // If changing username, check for duplicates
    if (body.username && body.username !== admin.username) {
      if (body.username.length < 3 || body.username.length > 50) {
        return NextResponse.json(
          { error: 'Username must be between 3 and 50 characters' },
          { status: 400 }
        );
      }
      const existing = await db.admin.findUnique({
        where: { username: body.username },
      });
      if (existing) {
        return NextResponse.json(
          { error: 'Username already exists' },
          { status: 409 }
        );
      }
    }

    // Build update data
    const updateData: { username?: string; password?: string } = {};
    if (body.username) updateData.username = body.username;
    if (body.newPassword) {
      // FIX: Hash the new password with bcrypt
      updateData.password = await bcrypt.hash(body.newPassword, 10);
    }

    const updated = await db.admin.update({
      where: { id },
      data: updateData,
      select: { id: true, username: true, updatedAt: true },
    });

    return NextResponse.json({ admin: updated });
  } catch (error) {
    console.error('Error updating admin:', error);
    return NextResponse.json({ error: 'Failed to update admin' }, { status: 500 });
  }
}

// ─── DELETE /api/admin/[id] ───
// Delete an admin user (cannot delete self)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // FIX: Validate session against database
    const currentAdmin = await requireAuth();
    if (!currentAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Cannot delete yourself
    if (id === currentAdmin.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Verify the admin exists
    const admin = await db.admin.findUnique({ where: { id } });
    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    // Prevent deleting the last admin
    const adminCount = await db.admin.count();
    if (adminCount <= 1) {
      return NextResponse.json(
        { error: 'Cannot delete the last admin account' },
        { status: 400 }
      );
    }

    await db.admin.delete({ where: { id } });

    return NextResponse.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    console.error('Error deleting admin:', error);
    return NextResponse.json({ error: 'Failed to delete admin' }, { status: 500 });
  }
}

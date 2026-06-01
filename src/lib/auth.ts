// ─── Shared Authentication Helper ───
// Validates the admin_session cookie against the database.
// FIX: Previously, protected routes only checked if the cookie existed,
// allowing any non-empty string to pass as authenticated.
// Now we actually verify the session ID corresponds to a real admin.

import { cookies } from "next/headers";
import { db } from "@/lib/db";

export interface AuthenticatedAdmin {
  id: string;
  username: string;
}

/**
 * Verify that the current request is from an authenticated admin.
 * Returns the admin record if valid, or null if not authenticated.
 *
 * Usage in API routes:
 * ```ts
 * const admin = await requireAuth();
 * if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 * ```
 */
export async function requireAuth(): Promise<AuthenticatedAdmin | null> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("admin_session")?.value;

    if (!sessionId) return null;

    // CRITICAL FIX: Verify the session ID actually exists in the database
    const admin = await db.admin.findUnique({
      where: { id: sessionId },
      select: { id: true, username: true },
    });

    return admin;
  } catch {
    return null;
  }
}

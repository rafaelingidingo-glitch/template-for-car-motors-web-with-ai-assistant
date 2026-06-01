// ─── Shared Chat Cache Module ───
// Allows the cars API and settings API to invalidate the AI chat's
// cached inventory data when the database changes.
// This ensures the AI always references up-to-date vehicle listings.

let invalidateCallback: (() => void) | null = null;

/**
 * Register the cache invalidation callback from the chat API route.
 * Called once during module initialization.
 */
export function registerChatCacheInvalidator(cb: () => void) {
  invalidateCallback = cb;
}

/**
 * Invalidate the AI chat's cached dealership data.
 * Call this after any car or settings CRUD operation.
 */
export function invalidateChatCache() {
  if (invalidateCallback) {
    invalidateCallback();
  }
}

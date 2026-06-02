/**
 * Generate a stable-ish file id. Uses crypto.randomUUID if available,
 * falls back to a timestamp + random string for SSR / older targets.
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `rup-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Placeholder auth helper for the client snapshot.
 * The real Supabase integration remains in the proprietary backend.
 */
export const supabase = null

/**
 * Returns false because Supabase is not initialized in this snapshot.
 */
export const isSupabaseAvailable = (): boolean => false

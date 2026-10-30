/**
 * Server-only settings. None of these use the VITE_ prefix, so Vite never puts them in the
 * browser bundle; they exist only in the serverless functions (and the local dev server).
 */
export interface ServerEnv {
  supabaseUrl: string;
  /** Supabase secret (service role) key: bypasses row-level security, so it must never leave the server. */
  supabaseKey: string;
  /** Signs admin sessions and keys the hashes of visitor IPs used for rate limiting. */
  sessionSecret: string;
  adminPassword?: string;
  /** Optional: without it messages are still saved, and the admin panel flags them as not delivered. */
  telegram: { token: string; chatId: string } | null;
}

/** The settings, or null when a required one is missing; missing names are logged, values never are. */
export function serverEnv({ admin = false } = {}): ServerEnv | null {
  const { SUPABASE_URL, SUPABASE_SECRET_KEY, SESSION_SECRET, ADMIN_PASSWORD, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;
  const required: Record<string, string | undefined> = { SUPABASE_URL, SUPABASE_SECRET_KEY, SESSION_SECRET };
  if (admin) required.ADMIN_PASSWORD = ADMIN_PASSWORD;

  const missing = Object.keys(required).filter((name) => !required[name]);
  if (SESSION_SECRET && SESSION_SECRET.length < 32) missing.push('SESSION_SECRET (needs 32+ characters)');
  // Only the project origin counts, so a pasted API URL (…supabase.co/rest/v1/) works too.
  const supabaseUrl = SUPABASE_URL && URL.canParse(SUPABASE_URL.trim()) ? new URL(SUPABASE_URL.trim()).origin : null;
  if (SUPABASE_URL && !supabaseUrl) missing.push('SUPABASE_URL (not a valid URL)');
  if (missing.length) {
    console.error(`[env] Missing server settings: ${missing.join(', ')}`);
    return null;
  }

  return {
    supabaseUrl: supabaseUrl!,
    supabaseKey: SUPABASE_SECRET_KEY!,
    sessionSecret: SESSION_SECRET!,
    adminPassword: ADMIN_PASSWORD || undefined,
    telegram: TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID ? { token: TELEGRAM_BOT_TOKEN, chatId: TELEGRAM_CHAT_ID } : null,
  };
}

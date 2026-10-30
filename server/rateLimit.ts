import { createHmac } from 'node:crypto';
import { rest } from './db.js';
import type { ServerEnv } from './env.js';

/**
 * True once `ip` has gone over `max` requests in `scope` within the window. Counted in the database
 * (supabase/messages.sql → hit_rate_limit), so every serverless instance shares one tally.
 * IPs are only ever stored as keyed hashes.
 */
export async function overLimit(env: ServerEnv, scope: string, ip: string, max: number, windowSeconds: number, { failClosed = false } = {}) {
  const key = `${scope}:${createHmac('sha256', env.sessionSecret).update(ip).digest('base64url').slice(0, 24)}`;
  try {
    const res = await rest(env, 'rpc/hit_rate_limit', {
      method: 'POST',
      body: JSON.stringify({ p_key: key, p_window_seconds: windowSeconds, p_max: max }),
    });
    return (await res.json()) === false;
  } catch (error) {
    // The contact form fails open (a broken counter mustn't cost a visitor their message); the login fails closed.
    console.error(`[rate-limit] ${scope}:`, error instanceof Error ? error.message : error);
    return failClosed;
  }
}

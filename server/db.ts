import type { ServerEnv } from './env.js';

/**
 * Calls the Supabase REST API (PostgREST) with the secret key. Values travel as JSON bodies or
 * validated filters, never as SQL text, so there is nothing to inject into.
 */
export async function rest(env: ServerEnv, path: string, init: { method?: string; body?: string; headers?: Record<string, string> } = {}) {
  const key = env.supabaseKey;
  const res = await fetch(`${env.supabaseUrl}/rest/v1/${path}`, {
    method: init.method,
    body: init.body,
    headers: {
      apikey: key,
      // Legacy service_role keys are JWTs and go in Authorization too; the newer sb_secret_ keys must not.
      ...(key.startsWith('eyJ') ? { Authorization: `Bearer ${key}` } : {}),
      'Content-Type': 'application/json',
      ...init.headers,
    },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Database request failed (${res.status}): ${(await res.text().catch(() => '')).slice(0, 300)}`);
  return res;
}

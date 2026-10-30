import { passwordMatches, sessionCookie } from '../../server/auth.js';
import { serverEnv } from '../../server/env.js';
import { clientIp, json, readJson, sameOrigin } from '../../server/http.js';
import { overLimit } from '../../server/rateLimit.js';

/** POST /api/admin/login { password }: sets the session cookie. 10 attempts per IP per 15 minutes. */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: 'forbidden' }, 403);
  const env = serverEnv({ admin: true });
  if (!env) return json({ error: 'unavailable' }, 503);
  if (await overLimit(env, 'login', clientIp(request), 10, 15 * 60, { failClosed: true })) return json({ error: 'rate_limited' }, 429);

  const body = await readJson(request, 1024);
  const password = typeof body?.password === 'string' ? body.password : '';
  if (!password || password.length > 256 || !passwordMatches(env, password)) return json({ error: 'wrong_password' }, 401);
  return json({ ok: true }, 200, { 'Set-Cookie': sessionCookie(env, request) });
}

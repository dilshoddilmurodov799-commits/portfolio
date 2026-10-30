import { clearedCookie } from '../../server/auth.js';
import { empty, json, sameOrigin } from '../../server/http.js';

/** POST /api/admin/logout: clears the session cookie. */
export function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: 'forbidden' }, 403);
  return empty(204, { 'Set-Cookie': clearedCookie(request) });
}

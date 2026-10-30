/** Small helpers shared by the api/ functions, which use the Web Request/Response API. */

const BASE_HEADERS = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };

export function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...BASE_HEADERS, 'Content-Type': 'application/json; charset=utf-8', ...headers },
  });
}

export function empty(status = 204, headers: Record<string, string> = {}) {
  return new Response(null, { status, headers: { ...BASE_HEADERS, ...headers } });
}

/** Logs what went wrong and answers with a generic 500: internals never reach the client. */
export function serverError(scope: string, error: unknown) {
  console.error(`[${scope}]`, describe(error));
  return json({ error: 'server' }, 500);
}

export const describe = (error: unknown) => (error instanceof Error ? error.message : String(error));

/** A JSON object body of at most `limit` bytes, or null for anything else (wrong type, too big, malformed). */
export async function readJson(request: Request, limit: number): Promise<Record<string, unknown> | null> {
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return null;
  if (Number(request.headers.get('content-length') ?? 0) > limit) return null;
  const text = await request.text();
  if (Buffer.byteLength(text) > limit) return null;
  try {
    const value: unknown = JSON.parse(text);
    return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** The caller's IP as the platform reports it (Vercel sets these headers itself, so clients can't spoof them). */
export function clientIp(request: Request) {
  return request.headers.get('x-real-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
}

/** Requests that change something must come from this site's own pages: blocks cross-site forgery and naive scripts. */
export function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try {
    const host = request.headers.get('x-forwarded-host') ?? new URL(request.url).host;
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** Plain HTTP is only allowed for local development. */
export const isLocal = (request: Request) => ['localhost', '127.0.0.1', '[::1]'].includes(new URL(request.url).hostname);

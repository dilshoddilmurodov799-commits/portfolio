import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import type { ServerEnv } from './env.js';
import { isLocal } from './http.js';

/**
 * One password (ADMIN_PASSWORD, server-side only) and a signed, expiring session cookie.
 * The cookie is HttpOnly (scripts can't read it), SameSite=Strict (other sites can't make the
 * browser send it), scoped to /api/admin, and Secure everywhere except local development.
 */
const COOKIE = 'admin_session';
const TTL_SECONDS = 12 * 60 * 60;

const sha256 = (value: string) => createHash('sha256').update(value).digest();

/** Compares digests in constant time, so response timing reveals nothing about the password. */
export function passwordMatches(env: ServerEnv, input: string) {
  return Boolean(env.adminPassword) && timingSafeEqual(sha256(input), sha256(env.adminPassword!));
}

// The signature covers the password too: changing ADMIN_PASSWORD signs every existing session out.
const sign = (env: ServerEnv, expires: number) =>
  createHmac('sha256', env.sessionSecret).update(`admin:${expires}:`).update(sha256(env.adminPassword ?? '')).digest('base64url');

const cookie = (request: Request, value: string, maxAge: number) =>
  `${COOKIE}=${value}; Path=/api/admin; Max-Age=${maxAge}; HttpOnly; SameSite=Strict${isLocal(request) ? '' : '; Secure'}`;

export function sessionCookie(env: ServerEnv, request: Request) {
  const expires = Math.floor(Date.now() / 1000) + TTL_SECONDS;
  return cookie(request, `${expires}.${sign(env, expires)}`, TTL_SECONDS);
}

export const clearedCookie = (request: Request) => cookie(request, '', 0);

export function isAdmin(env: ServerEnv, request: Request) {
  if (!env.adminPassword) return false;
  const value = request.headers
    .get('cookie')
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE}=`))
    ?.slice(COOKIE.length + 1);
  const [expires, signature = ''] = (value ?? '').split('.');
  const at = Number(expires);
  if (!Number.isInteger(at) || at < Date.now() / 1000) return false;
  const expected = Buffer.from(sign(env, at));
  const given = Buffer.from(signature);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

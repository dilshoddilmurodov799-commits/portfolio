/** Client for the admin API (api/admin/*). The session is an HttpOnly cookie the browser sends by itself. */

export interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  read: boolean;
  archived: boolean;
  /** False when the Telegram alert didn't go through. */
  notified: boolean;
}

export type Flags = Partial<Pick<Message, 'read' | 'archived'>>;

/** The session is missing or has expired: show the password screen again. */
export class SignedOut extends Error {}
/** The server is missing its settings (SUPABASE_URL, SUPABASE_SECRET_KEY, SESSION_SECRET, ADMIN_PASSWORD). */
export class NotConfigured extends Error {}

async function call(path: string, init: { method?: string; body?: unknown } = {}) {
  const res = await fetch(`/api/admin/${path}`, {
    method: init.method,
    headers: init.body ? { 'Content-Type': 'application/json' } : undefined,
    body: init.body ? JSON.stringify(init.body) : undefined,
  });
  if (res.status === 401) throw new SignedOut();
  if (res.status === 503) throw new NotConfigured();
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res;
}

export type LoginResult = 'ok' | 'wrong' | 'limited' | 'unavailable' | 'error';

export async function login(password: string): Promise<LoginResult> {
  try {
    await call('login', { method: 'POST', body: { password } });
    return 'ok';
  } catch (error) {
    if (error instanceof SignedOut) return 'wrong';
    if (error instanceof NotConfigured) return 'unavailable';
    return error instanceof Error && error.message.includes('429') ? 'limited' : 'error';
  }
}

export const logout = () => call('logout', { method: 'POST' });

export const listMessages = async (): Promise<Message[]> => (await (await call('messages')).json()).messages;

export const updateMessage = (id: string, flags: Flags) => call(`messages?id=${encodeURIComponent(id)}`, { method: 'PATCH', body: flags });

export const deleteMessage = (id: string) => call(`messages?id=${encodeURIComponent(id)}`, { method: 'DELETE' });

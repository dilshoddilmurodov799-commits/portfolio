/** Contact messages, stored in a Supabase table through its REST API (see supabase/messages.sql). */

export interface NewMessage {
  name: string;
  email: string;
  org: string | null;
  message: string;
}

export interface Message extends NewMessage {
  id: string;
  created_at: string;
}

const url: string | undefined = import.meta.env.VITE_SUPABASE_URL;
const key: string | undefined = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** False until both env vars are set; the contact form then falls back to mailto. */
export const messagesEnabled = Boolean(url && key);

async function request(query: string, init?: RequestInit) {
  if (!url || !key) throw new Error('Supabase is not configured (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).');
  const res = await fetch(`${url.replace(/\/+$/, '')}/rest/v1/messages${query}`, {
    ...init,
    headers: { apikey: key, 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!res.ok) throw new Error(`${res.status} ${(await res.text()) || res.statusText}`);
  return res;
}

export async function sendMessage(msg: NewMessage) {
  await request('', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(msg) });
}

export async function listMessages(): Promise<Message[]> {
  const res = await request('?select=id,created_at,name,email,org,message&order=created_at.desc');
  return res.json();
}

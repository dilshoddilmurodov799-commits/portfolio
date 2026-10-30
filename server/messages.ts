import { rest } from './db.js';
import type { ServerEnv } from './env.js';

export interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  read: boolean;
  archived: boolean;
  /** True once the Telegram notification went through. */
  notified: boolean;
}

export type NewMessage = Pick<Message, 'name' | 'email' | 'subject' | 'message'>;
export type MessageFlags = Partial<Pick<Message, 'read' | 'archived' | 'notified'>>;

const COLUMNS = 'id,name,email,subject,message,created_at,read,archived,notified';
const RETURN_ROWS = { Prefer: 'return=representation' };

export async function createMessage(env: ServerEnv, input: NewMessage): Promise<Message> {
  const res = await rest(env, `messages?select=${COLUMNS}`, { method: 'POST', headers: RETURN_ROWS, body: JSON.stringify(input) });
  const [row] = (await res.json()) as Message[];
  return row;
}

/** Newest first. A personal inbox stays small; the cap just keeps one response bounded. */
export async function listMessages(env: ServerEnv): Promise<Message[]> {
  const res = await rest(env, `messages?select=${COLUMNS}&order=created_at.desc&limit=1000`);
  return (await res.json()) as Message[];
}

/** `id` must already be a validated UUID. Null when there is no such message. */
export async function updateMessage(env: ServerEnv, id: string, flags: MessageFlags): Promise<Message | null> {
  const res = await rest(env, `messages?id=eq.${id}&select=${COLUMNS}`, { method: 'PATCH', headers: RETURN_ROWS, body: JSON.stringify(flags) });
  const [row] = (await res.json()) as Message[];
  return row ?? null;
}

/** `id` must already be a validated UUID. False when there was nothing to delete. */
export async function deleteMessage(env: ServerEnv, id: string): Promise<boolean> {
  const res = await rest(env, `messages?id=eq.${id}&select=id`, { method: 'DELETE', headers: RETURN_ROWS });
  return ((await res.json()) as unknown[]).length > 0;
}

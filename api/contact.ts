import { serverEnv } from '../server/env.js';
import { clientIp, describe, json, readJson, sameOrigin, serverError } from '../server/http.js';
import { createMessage, updateMessage } from '../server/messages.js';
import { overLimit } from '../server/rateLimit.js';
import { notifyNewMessage } from '../server/telegram.js';
import { looksAutomated, parseContact } from '../server/validation.js';

/**
 * POST /api/contact: the public contact form. Answers with a status only, never with stored data:
 * validate → rate-limit → save → notify on Telegram → 201.
 */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: 'forbidden' }, 403);
  const env = serverEnv();
  if (!env) return json({ error: 'unavailable' }, 503);

  const body = await readJson(request, 16 * 1024);
  if (!body) return json({ error: 'invalid' }, 400);
  // Bots get the same answer as people, so they learn nothing from it.
  if (looksAutomated(body)) return json({ ok: true }, 201);

  const parsed = parseContact(body);
  if (!parsed.ok) return json({ error: 'invalid', fields: parsed.fields }, 400);
  if (await overLimit(env, 'contact', clientIp(request), 5, 60 * 60)) return json({ error: 'rate_limited' }, 429);

  let message;
  try {
    message = await createMessage(env, parsed.value);
  } catch (error) {
    return serverError('contact', error);
  }

  // The message is saved: a Telegram failure is logged and flagged in the admin panel, not reported to the visitor.
  if (await notifyNewMessage(env, message)) {
    await updateMessage(env, message.id, { notified: true }).catch((error) => console.error('[contact] could not record the notification:', describe(error)));
  }
  return json({ ok: true }, 201);
}

import { isAdmin } from '../../server/auth.js';
import { serverEnv } from '../../server/env.js';
import type { ServerEnv } from '../../server/env.js';
import { empty, json, readJson, sameOrigin, serverError } from '../../server/http.js';
import { deleteMessage, listMessages, updateMessage } from '../../server/messages.js';
import type { MessageFlags } from '../../server/messages.js';
import { isUuid } from '../../server/validation.js';

/**
 * /api/admin/messages: the inbox. Every method checks the session before touching data.
 *   GET                 → { messages }
 *   PATCH  ?id=<uuid>   { read?, archived? } → { message }
 *   DELETE ?id=<uuid>   → 204
 */
function guard(request: Request, changes: boolean): { env: ServerEnv } | { denied: Response } {
  if (changes && !sameOrigin(request)) return { denied: json({ error: 'forbidden' }, 403) };
  const env = serverEnv({ admin: true });
  if (!env) return { denied: json({ error: 'unavailable' }, 503) };
  if (!isAdmin(env, request)) return { denied: json({ error: 'unauthorized' }, 401) };
  return { env };
}

const idOf = (request: Request) => new URL(request.url).searchParams.get('id');

export async function GET(request: Request) {
  const access = guard(request, false);
  if ('denied' in access) return access.denied;
  try {
    return json({ messages: await listMessages(access.env) });
  } catch (error) {
    return serverError('admin', error);
  }
}

export async function PATCH(request: Request) {
  const access = guard(request, true);
  if ('denied' in access) return access.denied;
  const id = idOf(request);
  const body = await readJson(request, 1024);
  const flags: MessageFlags = {};
  if (typeof body?.read === 'boolean') flags.read = body.read;
  if (typeof body?.archived === 'boolean') flags.archived = body.archived;
  if (!isUuid(id) || !Object.keys(flags).length) return json({ error: 'invalid' }, 400);
  try {
    const message = await updateMessage(access.env, id, flags);
    return message ? json({ message }) : json({ error: 'not_found' }, 404);
  } catch (error) {
    return serverError('admin', error);
  }
}

export async function DELETE(request: Request) {
  const access = guard(request, true);
  if ('denied' in access) return access.denied;
  const id = idOf(request);
  if (!isUuid(id)) return json({ error: 'invalid' }, 400);
  try {
    return (await deleteMessage(access.env, id)) ? empty(204) : json({ error: 'not_found' }, 404);
  } catch (error) {
    return serverError('admin', error);
  }
}

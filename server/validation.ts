import type { NewMessage } from './messages.js';

/** Maximum lengths, mirrored by the form's maxLength attributes and the table's check constraints. */
export const LIMITS = { name: 100, email: 254, subject: 150, message: 5000 } as const;
export type ContactField = keyof typeof LIMITS;

// Control characters (except tab and newline) never belong in a message: matching them is the point here.
// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
// Half of an emoji (a lone UTF-16 surrogate) is invalid text: Postgres and Telegram both reject it.
const LONE_SURROGATE = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g;
// Deliberately plain: letters, digits and the usual punctuation, so no quotes or angle brackets get through.
const EMAIL = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** People take longer than this to fill in four fields; bots usually don't. */
const MIN_FILL_MS = 3000;

const clean = (value: string) => value.normalize('NFC').replace(CONTROL, '').replace(LONE_SURROGATE, '\uFFFD');

/** One line of text: whitespace collapsed and trimmed. */
const line = (value: unknown) => (typeof value === 'string' ? clean(value).replace(/\s+/g, ' ').trim() : '');

/** Free text: newlines kept, but trailing spaces and runs of blank lines tidied. */
const text = (value: unknown) =>
  typeof value === 'string'
    ? clean(value.replace(/\r\n?/g, '\n')).replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n').trim()
    : '';

export function parseContact(body: Record<string, unknown>): { ok: true; value: NewMessage } | { ok: false; fields: ContactField[] } {
  const value: NewMessage = {
    name: line(body.name),
    email: line(body.email).toLowerCase(),
    subject: line(body.subject),
    message: text(body.message),
  };
  const fields = (Object.keys(LIMITS) as ContactField[]).filter((field) => !value[field] || value[field].length > LIMITS[field]);
  if (!fields.includes('email') && !EMAIL.test(value.email)) fields.push('email');
  return fields.length ? { ok: false, fields } : { ok: true, value };
}

/** The hidden "website" field was filled in, or the form came back faster than a person could fill it. */
export function looksAutomated(body: Record<string, unknown>) {
  const honeypot = typeof body.website === 'string' && body.website !== '';
  const tooFast = !(typeof body.elapsed === 'number' && body.elapsed >= MIN_FILL_MS);
  return honeypot || tooFast;
}

export const isUuid = (value: string | null): value is string => value !== null && UUID.test(value);

import type { ServerEnv } from './env.js';
import type { Message } from './messages.js';

const RULE = '━━━━━━━━━━━━━━━━━━';
// Telegram caps a message at 4096 characters; longer ones are cut and read in full in the admin panel.
const MAX_BODY = 3000;
const received = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Tashkent', dateStyle: 'medium', timeStyle: 'short' });

/** Visitor text goes out as HTML, so it's escaped: nothing they type can become markup. */
const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function formatMessage(message: Message) {
  // Cut by characters, not UTF-16 units, so an emoji is never split in half.
  const chars = Array.from(message.message);
  const body = chars.length > MAX_BODY ? `${chars.slice(0, MAX_BODY).join('')}…\n\n(Full message in the admin panel.)` : message.message;
  return [
    RULE,
    '📩 <b>NEW PORTFOLIO MESSAGE</b>',
    '',
    `👤 <b>Name:</b> ${escape(message.name)}`,
    // Telegram turns a plain email address into a tappable link by itself.
    `📧 <b>Email:</b> ${escape(message.email)}`,
    `📝 <b>Subject:</b> ${escape(message.subject)}`,
    `🕒 <b>Received:</b> ${received.format(new Date(message.created_at))} (Tashkent)`,
    '',
    '💬 <b>Message:</b>',
    '',
    escape(body),
    RULE,
  ].join('\n');
}

/** Sends the new-message alert. Never throws: returns false and logs a line that contains no secrets. */
export async function notifyNewMessage(env: ServerEnv, message: Message) {
  if (!env.telegram) {
    console.warn('[telegram] TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID not set: message saved without a notification.');
    return false;
  }
  const body = JSON.stringify({
    chat_id: env.telegram.chatId,
    text: formatMessage(message),
    parse_mode: 'HTML',
    link_preview_options: { is_disabled: true },
  });
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${env.telegram.token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        signal: AbortSignal.timeout(4500),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; description?: string } | null;
      if (res.ok && data?.ok) return true;
      console.error(`[telegram] sendMessage failed: ${res.status} ${data?.description ?? ''}`);
      return false;
    } catch (error) {
      // A connection that never went through (TypeError) is retried once: nothing was sent, so no duplicate.
      // A timeout is not, because Telegram may already have delivered it.
      if (attempt === 1 && error instanceof TypeError) continue;
      // A network error can echo the request URL, which holds the bot token: log its kind only.
      const code = (error as { cause?: { code?: string } })?.cause?.code;
      console.error(`[telegram] sendMessage failed: ${error instanceof Error ? error.name : 'error'}${code ? ` (${code})` : ''}`);
      return false;
    }
  }
}

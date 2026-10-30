/** The public half of the contact form: POST /api/contact (see api/contact.ts). */

export interface ContactInput {
  name: string;
  email: string;
  subject: string;
  message: string;
  /** Honeypot: hidden from people, so only bots fill it in. */
  website: string;
  /** Milliseconds since the form appeared; instant submissions are treated as bots. */
  elapsed: number;
}

export type SendResult = 'sent' | 'invalid' | 'limited' | 'failed';

export async function sendMessage(input: ContactInput): Promise<SendResult> {
  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (res.ok) return 'sent';
    return res.status === 400 ? 'invalid' : res.status === 429 ? 'limited' : 'failed';
  } catch {
    return 'failed';
  }
}

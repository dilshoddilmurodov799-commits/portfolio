const full = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });
const day = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short' });
const clock = new Intl.DateTimeFormat(undefined, { timeStyle: 'short' });
const relative = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

/** "Oct 30, 2026, 4:40 PM" */
export const fullDate = (iso: string) => full.format(new Date(iso));

/** The time for today's messages, the date for older ones. */
export function shortDate(iso: string, now: number) {
  const date = new Date(iso);
  return date.toDateString() === new Date(now).toDateString() ? clock.format(date) : day.format(date);
}

/** "5 minutes ago", "yesterday", "3 weeks ago" */
export function ago(iso: string, now: number) {
  const seconds = (Date.parse(iso) - now) / 1000;
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  for (const [unit, size] of units) if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit);
  return 'just now';
}

export const subjectOf = (subject: string) => subject || '(no subject)';

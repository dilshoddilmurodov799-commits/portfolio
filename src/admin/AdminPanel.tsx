import { useCallback, useEffect, useState } from 'react';
import { Inbox, LogOut, RefreshCw, TriangleAlert } from 'lucide-react';
import { cx } from '../lib/cx';
import { deleteMessage, listMessages, logout, NotConfigured, SignedOut, updateMessage } from './api';
import type { Flags, Message } from './api';
import { ago, shortDate, subjectOf } from './format';
import Login from './Login';
import MessageView from './MessageView';
import { button, glass, icon } from './ui';

type Status = 'loading' | 'login' | 'ready' | 'unavailable' | 'error';
type Filter = 'inbox' | 'unread' | 'archived';

const FILTERS: { id: Filter; label: string; shows: (m: Message) => boolean; empty: string }[] = [
  { id: 'inbox', label: 'Inbox', shows: (m) => !m.archived, empty: 'No messages yet. New ones from the contact form land here.' },
  { id: 'unread', label: 'Unread', shows: (m) => !m.read && !m.archived, empty: 'You’re all caught up.' },
  { id: 'archived', label: 'Archived', shows: (m) => m.archived, empty: 'Nothing archived.' },
];

/** /adminpanel: password, then the inbox. Every change shows at once and rolls back if the server refuses it. */
export default function AdminPanel() {
  const [status, setStatus] = useState<Status>('loading');
  const [messages, setMessages] = useState<Message[]>([]);
  const [filter, setFilter] = useState<Filter>('inbox');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [now, setNow] = useState(0);

  const loaded = useCallback((list: Message[]) => {
    setMessages(list);
    setNow(Date.now());
    setNotice(null);
    setStatus('ready');
  }, []);

  const loadFailed = useCallback((error: unknown) => {
    if (error instanceof SignedOut) setStatus('login');
    else if (error instanceof NotConfigured) setStatus('unavailable');
    else {
      setNotice('Couldn’t load messages. Check your connection and try again.');
      setStatus((current) => (current === 'ready' ? current : 'error'));
    }
  }, []);

  const load = useCallback(() => listMessages().then(loaded, loadFailed), [loaded, loadFailed]);

  // The first answer decides between the password screen and the inbox.
  useEffect(() => {
    listMessages().then(loaded, loadFailed);
  }, [loaded, loadFailed]);

  const failed = (error: unknown) => {
    if (error instanceof SignedOut) setStatus('login');
    else setNotice('Couldn’t save that change. Please try again.');
  };

  const change = async (id: string, flags: Flags) => {
    const before = messages;
    setMessages((list) => list.map((m) => (m.id === id ? { ...m, ...flags } : m)));
    try {
      await updateMessage(id, flags);
    } catch (error) {
      setMessages(before);
      failed(error);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this message permanently?')) return;
    const before = messages;
    setMessages((list) => list.filter((m) => m.id !== id));
    setSelectedId(null);
    try {
      await deleteMessage(id);
    } catch (error) {
      setMessages(before);
      failed(error);
    }
  };

  // Opening a message marks it read; "Mark unread" puts it back. On phones the page scrolls to it.
  const open = (message: Message) => {
    setSelectedId(message.id);
    if (!message.read) void change(message.id, { read: true });
    if (window.matchMedia('(max-width: 1023.98px)').matches) {
      requestAnimationFrame(() => document.getElementById('message-view')?.scrollIntoView({ block: 'start' }));
    }
  };

  const signOut = async () => {
    await logout().catch(() => undefined);
    setMessages([]);
    setSelectedId(null);
    setStatus('login');
  };

  if (status === 'login') return <Login onSignedIn={load} />;
  if (status !== 'ready') return <Notice status={status} onRetry={load} />;

  const unread = messages.filter((m) => !m.read && !m.archived).length;
  const undelivered = messages.filter((m) => !m.notified).length;
  const latest = messages[0];
  const current = FILTERS.find((f) => f.id === filter)!;
  const shown = messages.filter(current.shows);
  const selected = messages.find((m) => m.id === selectedId);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label">Portfolio admin</p>
          <h1 className="mt-1.5 text-3xl tracking-[-0.03em]">Messages</h1>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={load} className={button}>
            <RefreshCw aria-hidden="true" className={icon} />
            Refresh
          </button>
          <button type="button" onClick={signOut} className={button}>
            <LogOut aria-hidden="true" className={icon} />
            Log out
          </button>
        </div>
      </header>

      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className={cx(glass, 'p-4 sm:p-5')}>
          <dt className="label">Total messages</dt>
          <dd className="mt-2 text-3xl tracking-[-0.03em] tabular">{messages.length}</dd>
        </div>
        <div className={cx(glass, 'p-4 sm:p-5')}>
          <dt className="label">Unread</dt>
          <dd className={cx('mt-2 text-3xl tracking-[-0.03em] tabular', unread > 0 && 'text-accent')}>{unread}</dd>
        </div>
        <div className={cx(glass, 'col-span-2 min-w-0 p-4 sm:col-span-1 sm:p-5')}>
          <dt className="label">Latest message</dt>
          <dd className="mt-2">
            {latest ? (
              <>
                <span className="block truncate text-lg">{latest.name}</span>
                <span className="text-sm text-fg-3">{ago(latest.created_at, now)}</span>
              </>
            ) : (
              <span className="text-fg-3">None yet</span>
            )}
          </dd>
        </div>
      </dl>

      {undelivered > 0 && (
        <p className="mt-3 flex items-start gap-2.5 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3 text-sm text-amber-100">
          <TriangleAlert aria-hidden="true" className={cx(icon, 'mt-0.5 text-amber-300')} />
          {undelivered === 1 ? '1 message wasn’t' : `${undelivered} messages weren’t`} delivered to Telegram. They’re saved here — check
          TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID on the server.
        </p>
      )}
      {notice && (
        <p role="alert" className="mt-3 rounded-xl border border-red-400/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-200">
          {notice}
        </p>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* On phones the list and the open message take turns; side by side from lg up. */}
        <section aria-label="Message list" className={cx(glass, 'min-w-0 overflow-hidden', selected && 'max-lg:hidden')}>
          <nav aria-label="Filter messages" className="flex gap-1 p-2">
            {FILTERS.map((f) => {
              const count = messages.filter(f.shows).length;
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={f.id === filter}
                  onClick={() => setFilter(f.id)}
                  className={cx(
                    'flex-1 rounded-full px-3 py-2 text-sm transition-colors',
                    f.id === filter ? 'bg-white/[0.09] text-fg' : 'text-fg-3 hover:text-fg',
                  )}
                >
                  {f.label} <span className="tabular text-fg-3">{count}</span>
                </button>
              );
            })}
          </nav>
          {shown.length ? (
            <ul>
              {shown.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => open(m)}
                    aria-current={m.id === selectedId || undefined}
                    className={cx(
                      'flex w-full gap-3 border-t border-white/[0.06] px-4 py-3.5 text-left transition-colors hover:bg-white/[0.04]',
                      m.id === selectedId && 'bg-white/[0.06]',
                    )}
                  >
                    <span aria-hidden="true" className={cx('mt-2 size-2 shrink-0 rounded-full', !m.read && 'bg-accent')} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-3">
                        <span className={cx('truncate', m.read ? 'text-fg-2' : 'font-semibold text-fg')}>
                          {!m.read && <span className="sr-only">Unread: </span>}
                          {m.name}
                        </span>
                        <time dateTime={m.created_at} className="shrink-0 text-xs text-fg-3 tabular">
                          {shortDate(m.created_at, now)}
                        </time>
                      </span>
                      <span className={cx('mt-0.5 block truncate text-sm', m.read ? 'text-fg-3' : 'text-fg')}>{subjectOf(m.subject)}</span>
                      <span className="mt-0.5 block truncate text-xs text-fg-3">{m.email}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="border-t border-white/[0.06] px-6 py-14 text-center text-sm text-fg-3">{current.empty}</p>
          )}
        </section>

        <section id="message-view" aria-label="Message" className={cx(glass, 'min-w-0 scroll-mt-4', !selected && 'max-lg:hidden')}>
          {selected ? (
            <MessageView
              message={selected}
              onBack={() => setSelectedId(null)}
              onChange={(flags) => change(selected.id, flags)}
              onDelete={() => remove(selected.id)}
            />
          ) : (
            <div className="grid h-full min-h-72 place-items-center p-8 text-center text-sm text-fg-3">
              <span>
                <Inbox aria-hidden="true" className="mx-auto mb-3 size-6" />
                Select a message to read it.
              </span>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/** Loading, not configured, or unreachable. */
function Notice({ status, onRetry }: { status: Status; onRetry: () => void }) {
  return (
    <main className="grid min-h-svh place-items-center px-4">
      {status === 'loading' ? (
        <p className="text-sm text-fg-3">Loading…</p>
      ) : (
        <div className={cx(glass, 'max-w-md p-6 sm:p-8')}>
          <h1 className="text-xl tracking-[-0.02em]">{status === 'unavailable' ? 'The backend isn’t configured yet' : 'Couldn’t load messages'}</h1>
          <p className="mt-3 text-sm leading-relaxed text-fg-2">
            {status === 'unavailable'
              ? 'Set SUPABASE_URL, SUPABASE_SECRET_KEY, SESSION_SECRET and ADMIN_PASSWORD on the server (see .env.example), then reload.'
              : 'The server didn’t answer. Check your connection and try again.'}
          </p>
          <button type="button" onClick={onRetry} className={cx(button, 'mt-6')}>
            <RefreshCw aria-hidden="true" className={icon} />
            Try again
          </button>
        </div>
      )}
    </main>
  );
}

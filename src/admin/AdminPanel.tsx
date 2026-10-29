import { useEffect, useState } from 'react';
import { listMessages, messagesEnabled } from '../lib/messages';
import type { Message } from '../lib/messages';

type State = { kind: 'loading' } | { kind: 'ready'; messages: Message[] } | { kind: 'error'; error: string };

const date = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });
const fetchState = (): Promise<State> =>
  listMessages().then(
    (messages) => ({ kind: 'ready', messages }),
    (e: unknown) => ({ kind: 'error', error: e instanceof Error ? e.message : String(e) }),
  );

const pill = 'rounded-full border border-line px-5 py-2.5 text-[15px] transition-colors hover:border-fg disabled:opacity-50';

function MessageItem({ m }: { m: Message }) {
  return (
    <li className="border-b border-line py-8">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <p className="text-[clamp(1.15rem,1.6vw,1.35rem)] tracking-[-0.02em]">
          {m.name}
          {m.org && <span className="text-fg-3"> · {m.org}</span>}
        </p>
        <time dateTime={m.created_at} className="text-sm text-fg-3 tabular">
          {date.format(new Date(m.created_at))}
        </time>
      </div>
      <a href={`mailto:${m.email}`} className="mt-1 inline-block break-all text-[15px] text-accent hover:underline">
        {m.email}
      </a>
      <p className="mt-4 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-fg-2">{m.message}</p>
    </li>
  );
}

/** Open (no login yet) list of messages left through the contact form. */
export default function AdminPanel() {
  const [state, setState] = useState<State>({ kind: 'loading' });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!messagesEnabled) return;
    let live = true;
    fetchState().then((next) => {
      if (live) setState(next);
    });
    return () => {
      live = false;
    };
  }, []);

  const refresh = async () => {
    setRefreshing(true);
    setState(await fetchState());
    setRefreshing(false);
  };

  const count = state.kind === 'ready' ? state.messages.length : null;

  return (
    <main className="mx-auto min-h-svh max-w-[960px] px-[var(--gutter)] py-[clamp(3rem,8vh,5rem)]">
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-8">
        <div>
          <p className="label">Admin panel</p>
          <h1 className="mt-3 text-[clamp(2.25rem,5vw,3.5rem)] leading-none tracking-[-0.04em]">
            Messages {count !== null && <span className="text-fg-3 tabular">{count}</span>}
          </h1>
        </div>
        <div className="flex gap-3">
          {messagesEnabled && (
            <button type="button" onClick={refresh} disabled={refreshing || state.kind === 'loading'} className={pill}>
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </button>
          )}
          <a href="/" className={pill}>
            Back to site
          </a>
        </div>
      </header>

      <div role="status" aria-live="polite">
        {!messagesEnabled ? (
          <div className="py-10 text-[15px] leading-relaxed text-fg-2">
            <p>Storage is not configured yet.</p>
            <p className="mt-2">
              Set <code className="text-fg">VITE_SUPABASE_URL</code> and <code className="text-fg">VITE_SUPABASE_ANON_KEY</code> (see{' '}
              <code className="text-fg">.env.example</code>) and run <code className="text-fg">supabase/messages.sql</code> in your Supabase project.
            </p>
          </div>
        ) : state.kind === 'loading' ? (
          <p className="py-10 text-[15px] text-fg-3">Loading messages…</p>
        ) : state.kind === 'error' ? (
          <p className="py-10 text-[15px] text-accent">Could not load messages: {state.error}</p>
        ) : state.messages.length === 0 ? (
          <p className="py-10 text-[15px] text-fg-3">No messages yet.</p>
        ) : null}
      </div>

      {state.kind === 'ready' && state.messages.length > 0 && (
        <ul>
          {state.messages.map((m) => (
            <MessageItem key={m.id} m={m} />
          ))}
        </ul>
      )}
    </main>
  );
}

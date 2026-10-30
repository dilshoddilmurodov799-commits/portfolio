import { useState } from 'react';
import type { FormEvent } from 'react';
import { LockKeyhole } from 'lucide-react';
import { cx } from '../lib/cx';
import { login } from './api';
import type { LoginResult } from './api';
import { button, glass, primary } from './ui';

const ERRORS: Record<Exclude<LoginResult, 'ok'>, string> = {
  wrong: 'Wrong password.',
  limited: 'Too many attempts. Wait 15 minutes and try again.',
  unavailable: 'The server isn’t configured yet: set its environment variables, then reload.',
  error: 'Couldn’t reach the server. Check your connection and try again.',
};

/** Password → Enter. The password is checked on the server; the browser only ever holds the session cookie. */
export default function Login({ onSignedIn }: { onSignedIn: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const password = String(new FormData(form).get('password') ?? '');
    if (!password || pending) return;
    setPending(true);
    setError(null);
    const result = await login(password);
    setPending(false);
    if (result === 'ok') return onSignedIn();
    setError(ERRORS[result]);
    form.reset();
    form.querySelector('input')?.focus();
  };

  return (
    <main className="grid min-h-svh place-items-center px-4 py-10">
      <form onSubmit={submit} className={cx(glass, 'w-full max-w-sm p-6 sm:p-8')}>
        <span className="grid size-11 place-items-center rounded-full border border-line">
          <LockKeyhole aria-hidden="true" className="size-5 text-fg-2" />
        </span>
        <p className="label mt-6">Portfolio admin</p>
        <h1 className="mt-2 text-2xl tracking-[-0.02em]">Enter password</h1>
        <label htmlFor="password" className="sr-only">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          maxLength={256}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'login-error' : undefined}
          className="mt-6 w-full rounded-xl border border-line bg-ink-2 px-4 py-3 text-[15px] outline-none transition-colors focus:border-fg-3"
        />
        {error && (
          <p id="login-error" role="alert" className="mt-3 text-sm text-red-300">
            {error}
          </p>
        )}
        <button type="submit" disabled={pending} className={cx(button, primary, 'mt-5 w-full py-3 text-[15px] font-medium')}>
          {pending ? 'Checking…' : 'Unlock'}
        </button>
      </form>
    </main>
  );
}

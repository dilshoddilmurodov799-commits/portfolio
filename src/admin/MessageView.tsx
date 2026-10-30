import { Archive, ArchiveRestore, ArrowLeft, Mail, MailOpen, Reply, Trash2 } from 'lucide-react';
import { cx } from '../lib/cx';
import type { Flags, Message } from './api';
import { fullDate, subjectOf } from './format';
import { button, danger, icon, primary } from './ui';

interface MessageViewProps {
  message: Message;
  onBack: () => void;
  onChange: (flags: Flags) => void;
  onDelete: () => void;
}

const badge = 'rounded-full border px-2.5 py-0.5 text-xs';

/** One message in full. Everything the visitor wrote is rendered as text, never as HTML. */
export default function MessageView({ message, onBack, onChange, onDelete }: MessageViewProps) {
  return (
    <article className="flex w-full min-w-0 flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.06] p-3 sm:p-4">
        <button type="button" onClick={onBack} className={cx(button, 'lg:hidden')}>
          <ArrowLeft aria-hidden="true" className={icon} />
          Back
        </button>
        <div className="ml-auto flex flex-wrap gap-2">
          <button type="button" onClick={() => onChange({ read: !message.read })} className={button}>
            {message.read ? <Mail aria-hidden="true" className={icon} /> : <MailOpen aria-hidden="true" className={icon} />}
            <span className="max-sm:sr-only">{message.read ? 'Mark unread' : 'Mark read'}</span>
          </button>
          <button type="button" onClick={() => onChange({ archived: !message.archived })} className={button}>
            {message.archived ? <ArchiveRestore aria-hidden="true" className={icon} /> : <Archive aria-hidden="true" className={icon} />}
            <span className="max-sm:sr-only">{message.archived ? 'Move to inbox' : 'Archive'}</span>
          </button>
          <button type="button" onClick={onDelete} className={cx(button, danger)}>
            <Trash2 aria-hidden="true" className={icon} />
            <span className="max-sm:sr-only">Delete</span>
          </button>
        </div>
      </div>

      <div className="p-5 sm:p-8">
        <div className="flex flex-wrap gap-2">
          {!message.read && <span className={cx(badge, 'border-accent/40 text-accent')}>Unread</span>}
          {message.archived && <span className={cx(badge, 'border-line text-fg-3')}>Archived</span>}
          {!message.notified && <span className={cx(badge, 'border-amber-400/30 text-amber-200')}>Not delivered to Telegram</span>}
        </div>
        <h2 className="mt-4 break-words text-2xl leading-tight tracking-[-0.02em] sm:text-3xl">{subjectOf(message.subject)}</h2>
        <dl className="mt-5 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-sm">
          <dt className="text-fg-3">From</dt>
          <dd className="break-words">
            {message.name} ·{' '}
            <a href={`mailto:${message.email}`} className="text-fg-2 underline decoration-line underline-offset-4 hover:text-fg">
              {message.email}
            </a>
          </dd>
          <dt className="text-fg-3">Received</dt>
          <dd>
            <time dateTime={message.created_at}>{fullDate(message.created_at)}</time>
          </dd>
        </dl>
        <p className="mt-7 whitespace-pre-wrap break-words border-t border-white/[0.06] pt-7 text-[15px] leading-relaxed">{message.message}</p>
        <a
          href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${subjectOf(message.subject)}`)}`}
          className={cx(button, primary, 'mt-8')}
        >
          <Reply aria-hidden="true" className={icon} />
          Reply by email
        </a>
      </div>
    </article>
  );
}

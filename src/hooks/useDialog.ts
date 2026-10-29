import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { useSmoothScroll } from '../providers/SmoothScroll';

const FOCUSABLE = 'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])';

/** Open dialogs, oldest first — only the newest responds to Escape. */
const stack: RefObject<HTMLElement | null>[] = [];

/** Modal behaviour: scroll lock, Escape to close, focus trap, and focus restore on close. */
export function useDialog(ref: RefObject<HTMLElement | null>, open: boolean, onClose: () => void) {
  const { stop, start } = useSmoothScroll();
  const close = useRef(onClose);

  useEffect(() => {
    close.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    stop();
    stack.push(ref);

    const raf = requestAnimationFrame(() => {
      const target = ref.current?.querySelector<HTMLElement>('[data-autofocus]') ?? ref.current?.querySelector<HTMLElement>(FOCUSABLE);
      target?.focus();
    });

    const onKey = (e: KeyboardEvent) => {
      if (stack[stack.length - 1] !== ref) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        close.current();
        return;
      }
      if (e.key !== 'Tab' || !ref.current) return;
      const items = Array.from(ref.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);

    return () => {
      cancelAnimationFrame(raf);
      stack.splice(stack.indexOf(ref), 1);
      document.removeEventListener('keydown', onKey);
      start();
      previouslyFocused?.focus({ preventScroll: true });
    };
  }, [open, ref, stop, start]);
}

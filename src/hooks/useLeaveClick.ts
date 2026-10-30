import type { MouseEvent } from 'react';
import { useCurtain } from '../providers/Curtain';

/** Click handler that leaves for `href` through the curtain; modified clicks (new tab, etc.) behave natively. */
export function useLeaveClick(href: string, label: string) {
  const { leave } = useCurtain();
  return (e: MouseEvent<HTMLElement>) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    leave(href, label);
  };
}

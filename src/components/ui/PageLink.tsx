import type { AnchorHTMLAttributes } from 'react';
import { useLeaveClick } from '../../hooks/useLeaveClick';

interface PageLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  /** Announced on the curtain while the next page loads; that page's opening scene should say the same. */
  label: string;
}

/** Link to another page that leaves through the curtain; modified clicks (new tab, etc.) behave natively. */
export default function PageLink({ href, label, onClick, ...rest }: PageLinkProps) {
  const leave = useLeaveClick(href, label);
  return (
    <a
      href={href}
      onClick={(e) => {
        onClick?.(e);
        leave(e);
      }}
      {...rest}
    />
  );
}

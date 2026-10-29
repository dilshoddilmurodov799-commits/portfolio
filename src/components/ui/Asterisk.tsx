/** Six-spoke asterisk — the site's mark, used in the logo, the name band and the curtain. */
export default function Asterisk({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true" className={className}>
      <path d="M12 2v20M3.34 7l17.32 10M3.34 17 20.66 7" />
    </svg>
  );
}

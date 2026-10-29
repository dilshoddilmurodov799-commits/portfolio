import { useSyncExternalStore } from 'react';

const subscribe = (onChange: () => void) => {
  window.addEventListener('scroll', onChange, { passive: true });
  window.addEventListener('resize', onChange);
  return () => {
    window.removeEventListener('scroll', onChange);
    window.removeEventListener('resize', onChange);
  };
};

/** True once the page has scrolled past `fraction` of the viewport height. */
export function useScrolledPast(fraction: number) {
  return useSyncExternalStore(
    subscribe,
    () => window.scrollY > window.innerHeight * fraction,
    () => false,
  );
}

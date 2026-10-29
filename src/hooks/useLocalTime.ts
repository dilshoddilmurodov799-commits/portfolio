import { useEffect, useState } from 'react';
import { TIMEZONE } from '../content/data';

const format = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: TIMEZONE });

/** Live HH:MM in Tashkent, re-rendering once per minute. */
export function useLocalTime() {
  const [time, setTime] = useState(() => format.format(new Date()));

  useEffect(() => {
    let interval: number | undefined;
    const update = () => setTime(format.format(new Date()));
    const timeout = window.setTimeout(() => {
      update();
      interval = window.setInterval(update, 60_000);
    }, 60_000 - (Date.now() % 60_000));
    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, []);

  return time;
}

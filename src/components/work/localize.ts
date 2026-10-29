import type { Dict } from '../../content/locales/en';
import type { WORK } from '../../content/data';

type WorkItem = (typeof WORK)[number];

/** Non-technical "stacks" and the open-ended period are translated; tech names are not. */
export function localizeWork(item: WorkItem, t: Dict) {
  const copy = t.work.items[item.id];
  return {
    copy,
    stack: 'stack' in copy ? copy.stack : item.stack,
    period: item.period.replace('present', t.work.present),
  };
}

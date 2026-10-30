import { CERTIFICATES, MILESTONES, certificatePath } from './data';
import type { Certificate } from './data';
import type { Dict } from './locales/en';

/** Names and dates a certificate from its journey milestone, so the copy lives in one place. */
export function describeCertificate(cert: Certificate, t: Dict) {
  const m = MILESTONES.find((milestone) => milestone.id === cert.milestone)!;
  const copy = t.journey.items[m.id as keyof typeof t.journey.items];
  const links = m.links ?? [];
  // A milestone with several certificates names each by its link label.
  const single = links.length === 1;
  return {
    name: single ? copy.title : copy.links[links.indexOf(certificatePath(cert.id))],
    org: copy.org,
    detail: single ? copy.detail : '',
    date: `${t.journey.months[m.month - 1]} ${m.year}`,
  };
}

export const certificateAt = (href: string) => CERTIFICATES.find((c) => certificatePath(c.id) === href);

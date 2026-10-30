// Locale-independent facts. Every value here is sourced from the CV
// (src/assets/DilshodDilmurodovCV.pdf) — keep it that way.
import cvUrl from '../assets/DilshodDilmurodovCV.pdf?url';
import certSat from '../assets/certificates/sat.png';
import certResponsive from '../assets/certificates/responsivewebdesign.jpg';
import certJs from '../assets/certificates/javascriptalgorithmsanddatastructures.jpg';
import certFrontend from '../assets/certificates/frontendprogramming.jpg';
import certReact from '../assets/certificates/reactjs.jpg';
import certMysql from '../assets/certificates/mysqldatabasedeveloper.jpg';
import certIelts from '../assets/certificates/ielts.png';

export const CV_URL = cvUrl;

export const CONTACT = {
  email: 'dilshoddilmurodov799@gmail.com',
  phone: '+998 77 731 05 36',
  phoneHref: 'tel:+998777310536',
  whatsapp: 'https://wa.me/998930854347',
  telegram: 'https://t.me/dan_thedeveloper',
  telegramHandle: '@dan_thedeveloper',
  linkedin: 'https://www.linkedin.com/in/dilshod-dilmurodov/',
  website: 'https://metaware.uz',
  // Not on the CV: the account this site's own repository lives under.
  github: 'https://github.com/dilshoddilmurodov799-commits',
} as const;

export const TIMEZONE = 'Asia/Tashkent';

export const MARQUEE_STACK = ['React', 'Next.js', 'TypeScript', 'Node.js', 'SQL', 'MongoDB', 'Python'] as const;

export const SECTION_IDS = ['about', 'work', 'skills', 'journey', 'contact'] as const;
export type SectionId = (typeof SECTION_IDS)[number];

export const STATS = [
  { value: 90, prefix: '', suffix: '+' },
  { value: 70, prefix: '', suffix: '+' },
  { value: 200, prefix: '~', suffix: '' },
  { value: 95, prefix: '', suffix: '/100' },
] as const;

export type WorkVisualKind = 'interface' | 'bots' | 'community' | 'portfolio';

/** Per-project light colour (RGB triplet) used in visuals and the reel backdrop. */
export const WORK_TINTS: Record<WorkVisualKind, string> = {
  interface: '120 146 255',
  bots: '86 205 196',
  community: '242 170 96',
  portfolio: '255 106 61',
};

export const WORK_KINDS = ['development', 'design', 'community'] as const;
export type WorkKind = (typeof WORK_KINDS)[number];

/**
 * `color` is the backdrop each project's artwork sits on — in the list preview, grid and case study.
 * `kinds` drive the filters on the all-projects page.
 */
export const WORK = [
  {
    id: 'portfolio', period: '2026', stack: ['React', 'TypeScript', 'Tailwind CSS', 'GSAP', 'Three.js', 'Node.js', 'Supabase', 'Telegram Bot API'],
    visual: 'portfolio', color: '#ff6a3d', kinds: ['design', 'development'], repo: `${CONTACT.github}/portfolio`,
  },
  { id: 'itpark', period: '2024 — 2025', stack: ['React', 'Next.js', 'Node.js', 'SQL'], visual: 'interface', color: '#1d2230', kinds: ['development'], repo: null },
  { id: 'bots', period: '2024 — 2025', stack: ['Python', 'Telegram Bot API'], visual: 'bots', color: '#18181b', kinds: ['development'], repo: null },
  { id: 'codenerd', period: '2025 — present', stack: [], visual: 'community', color: '#e9e4d8', kinds: ['community'], repo: null },
] as const satisfies readonly {
  id: string;
  period: string;
  stack: readonly string[];
  visual: WorkVisualKind;
  color: string;
  kinds: readonly WorkKind[];
  /** Public source code, when there is some. */
  repo: string | null;
}[];

/** Milestones featured on the sliding gallery's second row. */
export const HIGHLIGHTS = [
  { id: 'ielts', color: '#e9e4d8', dark: false },
  { id: 'devfest', color: '#1d2230', dark: true },
  { id: 'sat', color: '#ff6a3d', dark: false },
  { id: 'mu', color: '#18181b', dark: true },
] as const;

export const SOCIALS = [
  { label: 'LinkedIn', href: CONTACT.linkedin },
  { label: 'GitHub', href: CONTACT.github },
  { label: 'Telegram', href: CONTACT.telegram },
  { label: 'WhatsApp', href: CONTACT.whatsapp },
  { label: 'Email', href: `mailto:${CONTACT.email}` },
] as const;

/**
 * What I can do for a visitor, whole products first. Each row's band lists the tools behind it;
 * mentoring has no stack, so its band shows the localized soft skills instead.
 */
export const CAPABILITIES = [
  { id: 'build', stack: ['React', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'Git', 'GitHub'] },
  { id: 'frontend', stack: ['TypeScript', 'React', 'Next.js', 'JavaScript', 'HTML', 'CSS', 'Tailwind CSS'] },
  { id: 'backend', stack: ['Node.js', 'REST APIs', 'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Supabase', 'Python', 'Telegram Bot API'] },
  { id: 'interactive', stack: ['GSAP', 'Three.js', 'WebGL', 'Motion', 'Lenis'] },
  { id: 'mentoring' },
] as const;

export type SkillGroup = 'frontend' | 'backend' | 'data' | 'workflow';
export type EvidenceKey =
  | 'itpark' | 'codenerd' | 'bots' | 'portfolio'
  | 'fccRwd' | 'fccJs' | 'itFront' | 'itReact' | 'itMysql';

export interface SkillNode {
  id: string;
  label: string;
  group: SkillGroup;
  evidence: EvidenceKey[];
}

// Ordered top-to-bottom: the constellation lays these out in bands, frontend above data.
export const SKILLS: SkillNode[] = [
  { id: 'js', label: 'JavaScript', group: 'frontend', evidence: ['fccJs', 'itpark', 'codenerd'] },
  { id: 'html', label: 'HTML', group: 'frontend', evidence: ['fccRwd', 'itFront'] },
  { id: 'css', label: 'CSS', group: 'frontend', evidence: ['fccRwd', 'itFront'] },
  { id: 'tailwind', label: 'Tailwind CSS', group: 'frontend', evidence: ['portfolio'] },
  { id: 'ts', label: 'TypeScript', group: 'frontend', evidence: ['portfolio'] },
  { id: 'react', label: 'React', group: 'frontend', evidence: ['itReact', 'itpark', 'portfolio'] },
  { id: 'next', label: 'Next.js', group: 'frontend', evidence: ['itpark'] },
  { id: 'three', label: 'Three.js', group: 'frontend', evidence: [] },
  { id: 'node', label: 'Node.js', group: 'backend', evidence: ['itpark'] },
  { id: 'rest', label: 'REST APIs', group: 'backend', evidence: ['itpark'] },
  { id: 'python', label: 'Python', group: 'backend', evidence: ['bots'] },
  { id: 'sql', label: 'SQL', group: 'data', evidence: ['itpark', 'itMysql'] },
  { id: 'mysql', label: 'MySQL', group: 'data', evidence: ['itMysql'] },
  { id: 'mongo', label: 'MongoDB', group: 'data', evidence: [] },
  { id: 'git', label: 'Git', group: 'workflow', evidence: ['itpark'] },
  { id: 'github', label: 'GitHub', group: 'workflow', evidence: [] },
];

export const SKILL_EDGES: [string, string][] = [
  ['html', 'css'], ['css', 'tailwind'], ['html', 'js'], ['js', 'ts'], ['js', 'react'],
  ['ts', 'react'], ['react', 'next'], ['react', 'tailwind'], ['react', 'three'], ['js', 'three'],
  ['js', 'node'], ['ts', 'node'], ['next', 'node'], ['node', 'rest'], ['rest', 'react'],
  ['node', 'sql'], ['node', 'mongo'], ['sql', 'mysql'], ['python', 'sql'], ['python', 'rest'],
  ['git', 'github'], ['git', 'js'], ['github', 'html'],
];

export interface Certificate {
  id: string;
  /** The journey milestone it belongs to — its copy names and describes the certificate. */
  milestone: string;
  image: string;
  width: number;
  height: number;
  /** Where the issuer hosts the original, when it does. Kept for reference; not shown on the page. */
  verify?: string;
}

/** Scans from src/assets/certificates, each shown on its own page (see certificatePath). */
export const CERTIFICATES: Certificate[] = [
  { id: 'sat', milestone: 'sat', image: certSat, width: 817, height: 777 },
  { id: 'responsive-web-design', milestone: 'fcc', image: certResponsive, width: 1233, height: 832, verify: 'https://www.freecodecamp.org/certification/fcc534239b9-9a8b-4ed0-b70d-03c1f1e41f34/responsive-web-design' },
  { id: 'javascript-algorithms', milestone: 'fcc', image: certJs, width: 1229, height: 834, verify: 'https://www.freecodecamp.org/certification/fcc534239b9-9a8b-4ed0-b70d-03c1f1e41f34/javascript-algorithms-and-data-structures-v8' },
  { id: 'frontend-programming', milestone: 'itfront', image: certFrontend, width: 1165, height: 819, verify: 'https://itpark-bukhara.uz/certificate/A2442.pdf' },
  { id: 'reactjs', milestone: 'itreact', image: certReact, width: 688, height: 451, verify: 'https://itpark-bukhara.uz/certificate/A2954.pdf' },
  { id: 'mysql', milestone: 'itreact', image: certMysql, width: 816, height: 544, verify: 'https://itpark-bukhara.uz/certificate/A2949.pdf' },
  { id: 'ielts', milestone: 'ielts', image: certIelts, width: 596, height: 841 },
];

/** A standalone page (certificate/index.html), so static hosts serve it without SPA rewrites. */
export const certificatePath = (id: string) => `/certificate/?id=${id}`;

export type MilestoneType = 'work' | 'education' | 'certification' | 'community' | 'event';

export interface MilestoneMeta {
  id: string;
  year: number;
  month: number;
  type: MilestoneType;
  links?: string[];
}

export const MILESTONES: MilestoneMeta[] = [
  { id: 'globallc', year: 2023, month: 9, type: 'work' },
  { id: 'sat', year: 2024, month: 6, type: 'certification', links: [certificatePath('sat')] },
  { id: 'itpark', year: 2024, month: 10, type: 'work' },
  {
    id: 'fcc', year: 2025, month: 4, type: 'certification',
    links: [certificatePath('responsive-web-design'), certificatePath('javascript-algorithms')],
  },
  { id: 'itfront', year: 2025, month: 4, type: 'certification', links: [certificatePath('frontend-programming')] },
  { id: 'school', year: 2025, month: 5, type: 'education' },
  {
    id: 'itreact', year: 2025, month: 7, type: 'certification',
    links: [certificatePath('reactjs'), certificatePath('mysql')],
  },
  { id: 'mu', year: 2025, month: 9, type: 'education', links: ['https://millatumidi.uz'] },
  { id: 'codenerd', year: 2025, month: 9, type: 'community' },
  { id: 'ictweek', year: 2025, month: 9, type: 'event', links: ['https://www.wisestone-t.com/en/post/ictweekuzbekistan2025-en'] },
  { id: 'ielts', year: 2025, month: 11, type: 'certification', links: [certificatePath('ielts')] },
  {
    id: 'devfest', year: 2025, month: 12, type: 'event',
    links: ['https://gdg.community.dev/events/details/google-gdg-tashkent-presents-gdg-devfest-uzbekistan-2025-innovate-and-connect/'],
  },
  { id: 'itcom', year: 2026, month: 1, type: 'community', links: ['https://itcom.uz'] },
  { id: 'sevenplus', year: 2026, month: 2, type: 'work' },
];

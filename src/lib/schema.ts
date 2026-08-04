import { site } from '~/lib/site';

/**
 * Shared JSON-LD builders, matching the inline pattern already used across
 * the 23 service pages (see e.g. help-desk.astro / remote-monitoring.astro)
 * — extracted here so new pages don't re-invent the same six-line shape,
 * and so the two areaServed presets (local vs. remotely-deliverable) stay
 * consistent instead of drifting per page.
 */

export type FaqEntry = [question: string, answer: string];

/** The site's existing hyperlocal service area, as plain city strings —
 * matches the format every current serviceSchema.areaServed already uses. */
export const LOCAL_AREA_SERVED: string[] = site.serviceArea.map(
  (l) => `${l.city}, ${l.region}`,
);

/** Broader area for services that are genuinely deliverable without a
 * physical visit (help desk, RMM, cybersecurity, cloud, SASE, backup,
 * vendor management). Do NOT use this preset for Install-family services
 * (cameras, cabling, fiber, rack builds, door access) — those require an
 * on-site visit and should keep LOCAL_AREA_SERVED. */
export const REMOTE_AREA_SERVED: string[] = ['Utah', 'Idaho', 'United States'];

export function buildServiceSchema(opts: {
  serviceType: string;
  name: string;
  description: string;
  areaServed?: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: opts.serviceType,
    provider: { '@id': `${site.url}/#organization` },
    areaServed: opts.areaServed ?? LOCAL_AREA_SERVED,
    name: opts.name,
    description: opts.description,
  };
}

export function buildFaqSchema(faqs: FaqEntry[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(([question, answer]) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };
}

export interface BreadcrumbEntry {
  name: string;
  /** Path relative to site root, e.g. "/services/help-desk". Omit for the final (current-page) crumb if you'd rather not self-link — item is still required by the schema, so the current page's own URL is used. */
  path: string;
}

export function buildBreadcrumbSchema(entries: BreadcrumbEntry[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: entries.map((entry, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: entry.name,
      item: entry.path === '/' ? site.url : `${site.url}${entry.path}`,
    })),
  };
}

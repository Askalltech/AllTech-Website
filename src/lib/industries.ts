/**
 * The six client industries described on the homepage's "Who we support"
 * section (src/pages/index.astro). Lifted into its own module so the nav's
 * "Industries" dropdown (Header.astro) can list the same six without
 * duplicating the copy.
 *
 * `slug` doubles as the anchor id: nav items link to `/#${slug}` and the
 * homepage's SqueezeCarousel opens that industry's slide on load when the
 * hash matches (see SqueezeCarousel.tsx's initial-hash handling).
 */

export interface Industry {
  slug: string;
  title: string;
  body: string;
}

export const industries: Industry[] = [
  {
    slug: 'manufacturing',
    title: 'Manufacturing',
    body: "Production lines that can't afford downtime, specialty software that's picky about updates, and machines on the floor that still need a network connection. We know better than to push a patch in the middle of a shift.",
  },
  {
    slug: 'healthcare',
    title: 'Healthcare',
    body: "Patient records, scheduling systems, and compliance requirements that don't leave much room for error. We handle the technical side of keeping that data secure so your staff can focus on patients.",
  },
  {
    slug: 'professional-services',
    title: 'Professional Services',
    body: 'Law firms, accounting practices, and title companies need email, file access, and video calls to just work — plus the confidentiality their clients expect.',
  },
  {
    slug: 'multi-location',
    title: 'Multi-Location Organizations',
    body: 'Consistent support and security across every site, even the ones without IT staff of their own. One standard, wherever you open next.',
  },
  {
    slug: 'nonprofits',
    title: 'Nonprofits',
    body: "Real infrastructure and security on a budget that doesn't match a for-profit company's, without cutting corners on what protects your donor and client data.",
  },
  {
    slug: 'growing-businesses',
    title: 'Growing Businesses',
    body: 'The point where email, invoicing, and a shared drive stop being enough. We help you build the network and security foundation before you outgrow it twice.',
  },
];

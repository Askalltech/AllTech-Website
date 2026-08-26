/**
 * The client industries described on /industries (src/pages/industries.astro).
 * Lifted into its own module so the nav's "Industries" dropdown
 * (Header.astro) can list the same set without duplicating the copy.
 *
 * `slug` doubles as the anchor id: nav items link to `/industries#${slug}`
 * and that page's SqueezeCarousel opens the matching slide on load when the
 * hash matches (see SqueezeCarousel.tsx's initial-hash handling).
 */

export interface IndustryPhotoCredit {
  name: string;
  url: string;
}

export interface Industry {
  slug: string;
  title: string;
  body: string;
  /** Path under /public. Panels without one fall back to a gradient (see industries.astro). */
  image?: string;
  photoCredit?: IndustryPhotoCredit;
}

export const industries: Industry[] = [
  {
    slug: 'municipalities',
    title: 'Municipalities & Special Districts',
    body: "Public records requests, budget cycles, and a small (or one-person) IT team covering everything from the water district to city hall. We work within public-sector procurement and reporting requirements instead of around them.",
    image: '/industries/municipalities-tile.webp',
    photoCredit: { name: 'Dennis Zhang', url: 'https://unsplash.com/photos/historic-building-with-mountains-in-the-background-DoQClej5odE' },
  },
  {
    slug: 'government-contractors',
    title: 'Government Contractors',
    body: "CMMC and NIST 800-171 aren't optional line items when your contracts depend on them. We scope and maintain the controls that keep controlled unclassified information where it belongs.",
    image: '/industries/government-contractors-tile.webp',
    photoCredit: { name: 'Vishnu Mohanan', url: 'https://unsplash.com/photos/close-up-of-dark-blue-circuit-board-pfR18JNEMv8' },
  },
  {
    slug: 'nonprofits',
    title: 'Nonprofits & Associations',
    body: "Real infrastructure and security on a budget that doesn't match a for-profit company's, without cutting corners on what protects your donor and member data.",
    image: '/industries/nonprofits-tile.webp',
    photoCredit: { name: 'Compagnons', url: 'https://unsplash.com/photos/man-in-black-jacket-sitting-beside-black-flat-screen-computer-monitor-rWE7bTqgMJE' },
  },
  {
    slug: 'law-firms',
    title: 'Law Firms & Legal Services',
    body: "Case management systems, e-discovery, and client confidentiality that can't be an afterthought. Email, file access, and video calls that just work — plus the privilege your clients assume is already protected.",
    image: '/industries/law-firms-tile.webp',
    photoCredit: { name: 'Tingey Injury Law Firm', url: 'https://unsplash.com/photos/woman-holding-sword-statue-during-daytime-DZpc4UY8ZtY' },
  },
  {
    slug: 'financial-services',
    title: 'Financial Services',
    body: "Uptime for transactions that can't wait, fraud controls that actually get monitored, and compliance (GLBA, PCI) treated as an ongoing posture, not a once-a-year audit scramble.",
    image: '/industries/financial-services-tile.webp',
    photoCredit: { name: 'Kelly Sikkema', url: 'https://unsplash.com/photos/tax-forms-and-calculator-on-a-desk-QDwagaLNco4' },
  },
  {
    slug: 'healthcare',
    title: 'Healthcare Organizations',
    body: "Patient records, scheduling systems, and compliance requirements that don't leave much room for error. We handle the technical side of keeping that data secure so your staff can focus on patients.",
  },
  {
    slug: 'dental',
    title: 'Dental Offices & Practices',
    body: "Practice management software, imaging systems, and patient data under the same HIPAA requirements as a hospital — sized and priced for a single-location practice, not an enterprise health system.",
  },
  {
    slug: 'manufacturing',
    title: 'Manufacturing & Industrial Organizations',
    body: "Production lines that can't afford downtime, specialty software that's picky about updates, and machines on the floor that still need a network connection. We know better than to push a patch in the middle of a shift.",
  },
  {
    slug: 'automotive',
    title: 'Automotive Dealerships',
    body: "DMS integrations, FTC Safeguards Rule compliance, and a sales floor that can't afford a network hiccup during a deal. Multi-location support that keeps every store on the same standard.",
  },
  {
    slug: 'architecture-engineering',
    title: 'Architecture, Engineering & Professional Services',
    body: "Large CAD and BIM files, render farms, and client deliverables on a deadline. Accounting practices and title companies need the same thing in a different shape: email, file access, and the confidentiality clients expect.",
  },
  {
    slug: 'multi-location',
    title: 'Multi-Location Organizations',
    body: 'Consistent support and security across every site, even the ones without IT staff of their own. One standard, wherever you open next.',
  },
  {
    slug: 'growing-businesses',
    title: 'Growing Businesses',
    body: 'The point where email, invoicing, and a shared drive stop being enough. We help you build the network and security foundation before you outgrow it twice.',
  },
];

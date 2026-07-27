/**
 * Single source of truth for business info.
 * Used in: footer, contact page, JSON-LD schema, sitemap location pages,
 * and the OpenGraph defaults.
 *
 * Update here, propagates everywhere.
 */

export const site = {
  name: "AllTech",
  legalName: "AllTech",
  tagline: "IT, cybersecurity, and network infrastructure for Northern Utah & beyond.",
  description:
    "AllTech is a Northern Utah-based managed IT and cybersecurity provider serving businesses across northern Utah and southern Idaho. Cloudflare partner, UniFi specialist, Datto RMM.",
  url: "https://askalltech.com",

  // NAP — used in LocalBusiness schema, footer, contact page
  phone: "(435) 557-3232",
  phoneE164: "+14355573232",
  // Existing contract customers only — intentionally NOT displayed on the public
  // site. New/prospective inquiries come through the contact form, which routes
  // to the shared leadership/sales mailbox (address TBD).
  email: "help@askalltech.com",
  address: {
    street: "865 West Center Street, Bldg F",
    city: "Hyde Park",
    region: "UT",
    postalCode: "84318",
    country: "US",
  },
  geo: { latitude: 41.7977, longitude: -111.8222 }, // Hyde Park, UT

  hours: [
    // ISO weekday format for schema.org/OpeningHoursSpecification
    { days: ["Monday","Tuesday","Wednesday","Thursday","Friday"], open: "08:00", close: "17:00" },
  ],

  social: {
    // fill in when ready
    // facebook: "https://facebook.com/askalltech",
    // linkedin: "https://linkedin.com/company/askalltech",
  },

  // Service area — every city is its own LocalBusiness::areaServed entry and
  // gets a dedicated /locations/<slug> page for local SEO.
  serviceArea: [
    { city: "Logan",         region: "UT", slug: "logan" },
    { city: "Hyde Park",     region: "UT", slug: "hyde-park" },
    { city: "North Logan",   region: "UT", slug: "north-logan" },
    { city: "Smithfield",    region: "UT", slug: "smithfield" },
    { city: "Richmond",      region: "UT", slug: "richmond" },
    { city: "Providence",    region: "UT", slug: "providence" },
    { city: "Wellsville",    region: "UT", slug: "wellsville" },
    { city: "Tremonton",     region: "UT", slug: "tremonton" },
    { city: "Brigham City",  region: "UT", slug: "brigham-city" },
    { city: "Willard",       region: "UT", slug: "willard" },
    { city: "Preston",       region: "ID", slug: "preston-id" },
  ],
} as const;

// Top-level service catalogue. Each entry maps to /services/<slug>.
// `icon` matches a name in src/components/Icon.astro's icon kit.
export const services = [
  {
    slug: "managed-it",
    name: "Managed IT",
    short: "Help desk, monitoring, patching, vendor management — your outsourced IT department.",
    icon: "endpoint",
  },
  {
    slug: "cybersecurity",
    name: "Cybersecurity",
    short: "Endpoint security, email security, incident response, SOC monitoring, and pen testing.",
    icon: "shield",
  },
  {
    slug: "cloudflare-zero-trust",
    name: "Cloudflare Zero Trust",
    short:
      "As a Cloudflare Partner we design, deploy, and manage Zero Trust networks — tunnels, WARP, Gateway, Access — for multi-site organizations.",
    icon: "gateway",
    featured: true,
  },
  {
    slug: "network-design",
    name: "Network & Infrastructure",
    short: "Business-grade Wi-Fi, switching, and firewalls — plus the full UniFi line: Network, Protect cameras, and Access door entry. Ubiquiti UniFi specialists.",
    icon: "node",
  },
  {
    slug: "cloud-microsoft-365",
    name: "Microsoft 365 & Cloud",
    short: "M365 tenant setup, migration, Intune, Entra ID, and ongoing administration.",
    icon: "cloud-sync",
  },
  {
    slug: "alltech-top-10",
    name: "AllTech Top 10",
    short: "A pre-selected security stack for small and mid-sized business — the ten controls we deploy first, mapped to leading frameworks and continually refined as threats evolve.",
    icon: "stack",
  },
  {
    slug: "utah-data-recovery",
    name: "Utah Data Recovery",
    short: "Professional recovery for failed drives, SSDs, RAID arrays, and NAS systems — local, confidential, and handled in-house.",
    icon: "disk-recovery",
    // Routes to our dedicated data-recovery site rather than an internal page.
    url: "https://utahdatarecovery.com/",
  },
] as const;

export type ServiceSlug = typeof services[number]["slug"];

/**
 * Resolve a service's link target. If a service defines an external `url`
 * (e.g. Utah Data Recovery), link out to it; otherwise link to its detail page.
 */
export function serviceLink(s: { slug: string; url?: string }) {
  return s.url
    ? { href: s.url, external: true as const }
    : { href: `/services/${s.slug}`, external: false as const };
}

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

  // Existing-client ticket portal — separate system, separate domain.
  clientPortalUrl: "https://askalltech.itclientportal.com/ClientPortal/Login.aspx",

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
//
// Kept in sync with the 5 real categories in src/lib/menu.ts's
// menuCategories BY NAME AND SLUG (Cybersecurity, SASE Solutions, Network,
// Install, IT & Cloud) — this list drives the footer's "Services" column,
// and it had drifted from the header mega-menu: "Managed IT" pointed at
// managed-it, which has no custom page and fell through to [service].astro's
// generic stub; "Cloudflare Zero Trust" and the header's "SASE Solutions"
// were the same page under two different names; Install had no footer
// entry at all despite being a full mega-menu column. Fixed below. If you
// add a mega-menu category, add it here too — nothing keeps these in sync
// automatically.
export const services = [
  {
    slug: "cybersecurity",
    name: "Cybersecurity",
    short: "Endpoint security, email security, incident response, SOC monitoring, and pen testing.",
    icon: "shield",
  },
  {
    slug: "cloudflare-zero-trust",
    name: "SASE Solutions",
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
    slug: "install",
    name: "Install",
    short: "On-site low-voltage installation: UniFi Protect cameras, door access control, structured cabling, point-to-point wireless, fiber, and server-room buildouts.",
    icon: "camera",
  },
  {
    slug: "it-cloud",
    name: "IT & Cloud",
    short: "Outsourced IT: help desk, Datto RMM monitoring and patching, vendor management, Microsoft 365, Entra ID and Intune, and backup and disaster recovery.",
    icon: "endpoint",
  },
  {
    slug: "remote-it-support",
    name: "Remote IT Support",
    short: "Managed IT and cybersecurity delivered remotely — help desk, monitoring, cybersecurity, cloud, and backup and disaster recovery — wherever your team works.",
    icon: "cloud-sync",
    // Lives at the site root, not /services/<slug> — serviceLink() reads this.
    path: "/remote-it-support",
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
    short: "Professional recovery for failed drives, SSDs, RAID arrays, NAS systems, and phones — the only Class 100 cleanroom in Utah, plus digital forensic analysis for civil and criminal cases.",
    icon: "disk-recovery",
  },
] as const;

export type ServiceSlug = typeof services[number]["slug"];

/**
 * Resolve a service's link target. If a service defines an external `url`,
 * link out to it. If it defines an internal `path` (for a page that doesn't
 * live at /services/<slug>, e.g. Remote IT Support at the site root), use
 * that. Otherwise link to its /services/<slug> detail page.
 */
export function serviceLink(s: { slug: string; url?: string; path?: string }) {
  if (s.url) return { href: s.url, external: true as const };
  if (s.path) return { href: s.path, external: false as const };
  return { href: `/services/${s.slug}`, external: false as const };
}

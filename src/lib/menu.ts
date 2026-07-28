/**
 * Mega-menu data.
 *
 * Structure: categories → tiles. Each category becomes ONE COLUMN in the
 * unified mega-panel — same pattern as cloudflare.com (Compute / Storage /
 * AI / Security columns, all visible at once).
 *
 * Hovering the "Services" trigger opens the shared panel; each category
 * heading still links to its landing page when clicked.
 *
 * `sublabel` shows a small line under the heading (e.g. "Powered by Cloudflare").
 *
 * Adding a tile is purely additive — edit this file, the menu updates everywhere.
 */

export interface MenuTile {
  title: string;
  description: string;
  href: string;
}

export interface MenuCategory {
  label: string;        // top-nav label AND column heading in the panel
  sublabel?: string;    // small line under the heading
  href: string;         // landing page when the label itself is clicked
  tiles: MenuTile[];
}

export const menuCategories: MenuCategory[] = [
  {
    label: 'Cybersecurity',
    href: '/services/cybersecurity',
    tiles: [
      { title: 'Endpoint Security',   description: 'EDR & ransomware protection',                href: '/services/endpoint-security' },
      { title: 'Email Security',      description: 'Stop phishing, BEC, malware before delivery', href: '/services/email-security' },
      { title: 'Network Detection (NDR)', description: 'AI anomaly-based network threat detection',  href: '/services/network-detection' },
      { title: 'Managed SOC',         description: '24/7 monitoring & response',                  href: '/services/managed-soc' },
      { title: 'Penetration Testing', description: 'External, internal, web-app testing',         href: '/services/penetration-testing' },
      { title: 'Incident Response',   description: 'Active intrusion containment & forensics',    href: '/services/cybersecurity#ir' },
    ],
  },
  {
    label: 'SASE Solutions',
    sublabel: 'Powered by Cloudflare',
    href: '/services/cloudflare-zero-trust',
    tiles: [
      { title: 'Tunnel & WARP',     description: 'Replace your VPN with identity-aware access', href: '/services/cloudflare-zero-trust#tunnel' },
      { title: 'Access (ZTNA)',     description: 'Per-app authorization with any IdP',          href: '/services/cloudflare-zero-trust#access' },
      { title: 'Gateway',           description: 'DNS & HTTP filtering as a service',           href: '/services/cloudflare-zero-trust#gateway' },
      { title: 'Email Security',    description: 'Cloud email security in front of M365',       href: '/services/cloudflare-zero-trust#email' },
      { title: 'DNS & DDoS',        description: 'Authoritative DNS, attack mitigation',        href: '/services/cloudflare-zero-trust' },
    ],
  },
  {
    label: 'Network',
    href: '/services/network-design#unifi',
    tiles: [
      { title: 'Switching & Gateways', description: 'Business-grade switches & routers',  href: '/services/network-design#unifi' },
      { title: 'Wi-Fi Design',         description: 'Site survey, coverage, capacity',    href: '/services/network-design#wifi' },
      { title: 'Firewall & Routing',   description: 'Edge security & multi-WAN failover', href: '/services/network-design#firewall' },
      { title: 'Site-to-Site & SD-WAN', description: 'Secure multi-site connectivity',    href: '/services/network-design#cabling' },
    ],
  },
  {
    label: 'Install',
    sublabel: 'On-site & low-voltage',
    href: '/services/network-design#protect',
    tiles: [
      { title: 'Security Cameras',        description: 'Indoor & outdoor surveillance',   href: '/services/network-design#protect' },
      { title: 'Door Access Control',     description: 'Readers, mobile & card unlock',    href: '/services/network-design#access' },
      { title: 'Structured Cabling',      description: 'Low-voltage cabling & drops',      href: '/services/network-design#cabling' },
      { title: 'Point-to-Point Wireless', description: 'Bridge buildings & remote sites',  href: '/services/network-design#cabling' },
      { title: 'Rack & Server Rooms',     description: 'Racking & server-room buildouts',  href: '/services/network-design#cabling' },
    ],
  },
  {
    label: 'IT & Cloud',
    href: '/services/managed-it',
    tiles: [
      { title: 'Help Desk',             description: 'Local engineers, fast response',         href: '/services/managed-it#helpdesk' },
      { title: 'Remote Monitoring',     description: 'Datto RMM, patching, automation',        href: '/services/managed-it#rmm' },
      { title: 'Vendor Management',     description: 'One number for all your tech vendors',   href: '/services/managed-it#vendors' },
      { title: 'Microsoft 365',         description: 'Tenant design, licensing, migration',    href: '/services/cloud-microsoft-365#m365' },
      { title: 'Entra ID & Intune',     description: 'Identity & device management',           href: '/services/cloud-microsoft-365#intune' },
      { title: 'Backup & Disaster Recovery', description: 'Immutable copies & tested restores', href: '/services/backup-disaster-recovery' },
    ],
  },
];

/**
 * Simple links shown alongside the mega-menu trigger in the top nav.
 */
export const simpleNavLinks = [
  { href: '/case-studies', label: 'Case Studies' },
  { href: '/about',        label: 'About' },
  { href: '/team',         label: 'Our Team' },
  { href: '/blog',         label: 'Insights' },
];

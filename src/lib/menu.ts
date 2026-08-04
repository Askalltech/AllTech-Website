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
      { title: 'AllTech Top 10',      description: 'Our essential security controls, ranked',     href: '/services/alltech-top-10' },
      { title: 'Endpoint Security',   description: 'EDR & ransomware protection',                href: '/services/endpoint-security' },
      { title: 'Email Security',      description: 'Stop phishing, BEC, malware before delivery', href: '/services/email-security' },
      { title: 'Network Detection (NDR)', description: 'AI anomaly-based network threat detection',  href: '/services/network-detection' },
      { title: 'Managed SOC',         description: '24/7 monitoring & response',                  href: '/services/managed-soc' },
      { title: 'Penetration Testing', description: 'External, internal, web-app testing',         href: '/services/penetration-testing' },
      { title: 'Incident Response',   description: 'Active intrusion containment & forensics',    href: '/services/incident-response' },
    ],
  },
  {
    label: 'SASE Solutions',
    sublabel: 'Powered by Cloudflare',
    href: '/services/cloudflare-zero-trust',
    tiles: [
      { title: 'Zero Trust Access (ZTNA)', description: 'Identity-aware VPN replacement for remote teams', href: '/services/zero-trust-access' },
      { title: 'Secure Web Gateway',       description: 'Cloud-delivered DNS and HTTP threat filtering',   href: '/services/secure-web-gateway' },
      { title: 'Email Security',           description: 'Pre-inbox phishing defense for cloud mailboxes',  href: '/services/email-security' },
      { title: 'DNS & DDoS Protection',    description: 'Authoritative DNS and automated attack mitigation', href: '/services/dns-ddos-protection' },
      { title: 'Private Cloud Routing',    description: 'Connect infrastructure without public IP exposure', href: '/services/private-cloud-routing' },
    ],
  },
  {
    label: 'Network',
    href: '/services/network-design',
    tiles: [
      { title: 'Switching & Gateways', description: 'Business-grade switches & routers',  href: '/services/switching-and-gateways' },
      { title: 'Wi-Fi Design',         description: 'Site survey, coverage, capacity',    href: '/services/wifi-design' },
      { title: 'Firewall & Routing',   description: 'Edge security & multi-WAN failover', href: '/services/firewall-routing' },
      { title: 'Site-to-Site & SD-WAN', description: 'Secure multi-site connectivity',    href: '/services/site-to-site-sd-wan' },
    ],
  },
  {
    label: 'Install',
    sublabel: 'On-site & low-voltage',
    href: '/services/install',
    tiles: [
      { title: 'Security Cameras',        description: 'Indoor & outdoor surveillance',   href: '/services/security-cameras' },
      { title: 'Door Access Control',     description: 'Readers, mobile & card unlock',    href: '/services/door-access-control' },
      { title: 'Structured Cabling',      description: 'Low-voltage cabling & drops',      href: '/services/structured-cabling' },
      { title: 'Point-to-Point Wireless', description: 'Bridge buildings & remote sites',  href: '/services/point-to-point-wireless' },
      { title: 'Rack & Server Rooms',     description: 'Racking & server-room buildouts',  href: '/services/rack-server-rooms' },
      { title: 'Fiber Optic',             description: 'Splicing, termination & OTDR testing', href: '/services/fiber-optic' },
      { title: 'Network & IoT Cleaning',  description: 'Physical maintenance for hardware', href: '/services/network-iot-cleaning' },
    ],
  },
  {
    label: 'IT & Cloud',
    href: '/services/it-cloud',
    tiles: [
      { title: 'Help Desk',             description: 'Local engineers, fast response',         href: '/services/help-desk' },
      { title: 'Remote Monitoring',     description: 'Datto RMM, patching, automation',        href: '/services/remote-monitoring' },
      { title: 'Vendor Management',     description: 'One number for all your tech vendors',   href: '/services/vendor-management' },
      { title: 'Microsoft 365',         description: 'Tenant design, licensing, migration',    href: '/services/cloud-microsoft-365#m365' },
      { title: 'Entra ID & Intune',     description: 'Identity & device management',           href: '/services/entra-id-intune' },
      { title: 'Backup & Disaster Recovery', description: 'Immutable copies & tested restores', href: '/services/backup-disaster-recovery' },
      { title: 'Utah Data Recovery',    description: 'Hard drive, RAID, and phone data recovery', href: '/services/utah-data-recovery' },
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

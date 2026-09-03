/**
 * Names for the shared icon kit (src/components/Icon.astro), split into a
 * plain .ts module rather than exported from the .astro file itself.
 *
 * src/lib/site.ts needs this type (for relatedServiceIcon's return type) and
 * is itself imported by plain .tsx components (services13.tsx, services21.tsx
 * etc). A type-only import from a .astro file works fine through Astro's own
 * compiler, but breaks esbuild's bundling of a .ts file that pulls one in
 * transitively — it tries to parse the whole .astro file, template body
 * included, as TypeScript and fails on the JSX-like markup. Keeping the type
 * here sidesteps that path entirely.
 */
export type IconName =
  | 'node' // Network & Infrastructure — hub + spokes
  | 'shield' // Cybersecurity — square tapering to a point + check
  | 'endpoint' // Managed IT / Endpoint Security — device + status dot
  | 'cloud-sync' // Microsoft 365 & Cloud — stacked squares + sync marks
  | 'gateway' // SASE Solutions / Cloudflare Zero Trust — square + keyhole
  | 'disk-recovery' // Utah Data Recovery — square drive + restore arrow
  | 'camera' // Install: cameras
  | 'door-access' // Install: door access
  | 'stack' // AllTech Top 10 — three layered squares
  | 'dashboard-gauge'; // Assessment / monitoring — screen + gauge + bars

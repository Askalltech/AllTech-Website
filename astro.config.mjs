// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// IMPORTANT: update this to your live domain before first deploy.
// Used for absolute URLs in sitemap.xml, canonical tags, and OG meta.
const SITE_URL = 'https://askalltech.com';

export default defineConfig({
  site: SITE_URL,

  // Consolidated the old /cloudflare landing into the Cloudflare Zero Trust
  // service page — redirect so old links/bookmarks/SEO don't break.
  // The Tunnel & WARP page was renamed to match the SASE menu taxonomy — it is
  // the Zero Trust Access (ZTNA) story. Redirect the old route so shared links
  // and anything already indexed keep working.
  // Blog routes were renamed to /insights to match the nav label — redirect
  // the old URLs so bookmarks, shared links, and search results keep working.
  redirects: {
    '/cloudflare': '/services/cloudflare-zero-trust',
    '/services/tunnel-warp': '/services/zero-trust-access',
    '/blog': '/insights',
    '/blog/[...slug]': '/insights/[...slug]',
    // The about page was retired — its "who we are" content is now covered by /team.
    '/about': '/team',

    // ---- Legacy WordPress URLs (pre-2026 site) ----
    // Every URL indexed from the old Elementor site, mapped to its closest
    // equivalent here. Without these all 15 would 404 the moment the domain
    // cuts over, dropping whatever rankings and backlinks they carry. The old
    // paths all carried a trailing slash; Cloudflare normalises that before
    // matching, so the slashless key covers both forms.
    // See LAUNCH-CHECKLIST.md item 4.
    '/about-us': '/team',
    '/about-us/blog': '/insights',
    '/category/blog': '/insights',
    '/about-us/testimonials': '/case-studies',
    '/contact-us': '/contact',
    '/leave-feedback': '/contact',
    // "MTR — Management Threat Response" was the old name for what is now sold
    // as the managed SOC offering.
    '/mtr-management-threat-response': '/services/managed-soc',
    '/services/alltech-cyber-security': '/services/cybersecurity',
    '/services/alltech-data': '/services/utah-data-recovery',
    '/services/alltech-networking': '/services/network-design',
    '/services/computer-repair': '/services/help-desk',
    // NOT redirected, deliberately: /services/home-phone and
    // /services/internet-service-alltech-fiber. Both product lines are
    // retired and have no equivalent here, so they return 410 Gone from
    // their own routes rather than 301 to a page that doesn't sell the
    // thing the visitor came for. /services/fiber-optic in particular is
    // fiber *installation*, not internet service — pointing ISP traffic
    // there would mislead. See src/pages/services/home-phone.astro.
  },

  // Static by default; opt specific routes into SSR with `export const prerender = false`
  // (currently /api/assessment). Everything else is static HTML served from Cloudflare's edge.
  output: 'static',

  adapter: cloudflare({
    imageService: 'compile', // build-time image optimization; no Cloudflare Images binding needed
    platformProxy: { enabled: true }, // local dev mimics the Workers runtime
  }),

  integrations: [
    react(),
    mdx(),
    sitemap({
      filter: (page) =>
        !page.includes('/api/') && !page.includes('/draft/') && !page.includes('/legal/'),
      changefreq: 'weekly',
      priority: 0.7,
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  // Cleaner URLs: /services/cloudflare-zero-trust instead of /services/cloudflare-zero-trust/
  trailingSlash: 'never',
  build: {
    format: 'file',
  },
});

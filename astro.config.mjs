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
  },

  // Static by default; opt specific routes into SSR with `export const prerender = false`
  // (currently just /api/contact). Everything else is static HTML served from Cloudflare's edge.
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

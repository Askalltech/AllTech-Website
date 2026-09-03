import type { APIRoute } from 'astro';
import { site } from '~/lib/site';

/**
 * robots.txt is generated per-request rather than shipped as a static file in
 * public/, because the policy has to differ by hostname.
 *
 * The same Worker serves both the production domain and
 * development-preview.askalltech.com. A static file would hand the identical
 * crawl invitation to both — and inviting GPTBot / ClaudeBot / PerplexityBot to
 * the staging copy before launch is actively harmful: RAG engines would ingest
 * the preview host as the canonical AllTech entity, and those caches are slow
 * to refresh and hard to correct. So any host that isn't production gets a
 * blanket Disallow, and the policy flips itself when DNS moves. No launch-day
 * edit needed.
 *
 * See claude.md s7 (Deployment Reality Addendum), items C and F.
 */
export const prerender = false;

const PRODUCTION_HOST = new URL(site.url).host; // askalltech.com

/**
 * Crawlers we explicitly welcome. Note this list is NOT sufficient on its own:
 * the Cloudflare zone has managed robots.txt / AI Content Signals enabled,
 * which PREPENDS its own `User-agent: GPTBot -> Disallow: /` block above this
 * output. Because a named user-agent group overrides `User-agent: *` entirely,
 * Cloudflare's block wins and these agents stop regardless of what we say here.
 * That has to be turned off in the dashboard (zone -> AI Crawl Control) before
 * any of this takes effect. See claude.md s7 item B.
 *
 * `Googlebot-AI` from the source manual is omitted deliberately — it is not a
 * real crawler token.
 */
const AI_AGENTS = [
  'Googlebot',
  'Googlebot-Image',
  'Google-Extended',
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  'ClaudeBot',
  'Claude-SearchBot',
  'PerplexityBot',
  'cohere-ai',
];

/**
 * Paths kept out of every group. These must be repeated inside the named-agent
 * group below: a named group does not inherit the `User-agent: *` rules, so
 * omitting them (as the source manual's layout did) would silently grant the
 * AI crawlers access to exactly the routes we're protecting.
 */
const DISALLOWED = [
  ['/api/', 'SSR form endpoints — POST-only, nothing to index. Mirrors the sitemap filter in astro.config.mjs.'],
  ['/legal/', 'Unsigned MSA template, deliberately unlisted and excluded from the sitemap.'],
  ['/draft/', 'Unpublished content.'],
] as const;

/**
 * Pure host -> policy mapping, exported so it can be exercised directly.
 * `wrangler dev` rewrites both the Host header and request.url to the custom
 * domain in wrangler.toml's `routes`, so the two branches cannot be told apart
 * by curling the dev server — test this function instead.
 */
export function buildRobotsPolicy(host: string) {
  return host.toLowerCase() === PRODUCTION_HOST ? productionPolicy() : nonProductionPolicy(host);
}

export const GET: APIRoute = ({ request }) => {
  // Prefer the Host header: it is the hostname the client actually asked for.
  // request.url is a fallback — under `wrangler dev` it reports the custom
  // domain from wrangler.toml's `routes` regardless of the Host sent, which
  // makes the two branches untestable locally if you read it first.
  const host = request.headers.get('host') ?? new URL(request.url).host;
  const body = buildRobotsPolicy(host);

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      // Short TTL so the policy flips promptly when the domain cuts over.
      'Cache-Control': 'public, max-age=3600',
    },
  });
};

function nonProductionPolicy(host: string) {
  return `# ${host} is a non-production host serving a staging copy of ${PRODUCTION_HOST}.
# Disallowed in full so search and RAG engines don't index or ingest it as a
# duplicate of the live site. The production policy lives in the same file —
# see src/pages/robots.txt.ts.

User-agent: *
Disallow: /
`;
}

function productionPolicy() {
  const disallowBlock = DISALLOWED.map(([path, why]) => `# ${why}\nDisallow: ${path}`).join('\n');
  const agentBlock = AI_AGENTS.map((a) => `User-agent: ${a}`).join('\n');

  return `User-agent: *
Allow: /
${disallowBlock}

# Modern search and generative-retrieval crawlers are welcome on all public
# content. The Disallow lines are repeated here on purpose: a named user-agent
# group does not inherit the rules from "User-agent: *", so without them these
# agents would be granted the admin routes above.
${agentBlock}
Allow: /
${DISALLOWED.map(([path]) => `Disallow: ${path}`).join('\n')}

Sitemap: ${site.url}/sitemap-index.xml
`;
}

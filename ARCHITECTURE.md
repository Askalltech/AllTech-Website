# AllTech Website — Architecture Blueprint

**Stack:** Astro 5 + TypeScript + Tailwind v4, deployed to Cloudflare Pages via direct GitHub integration, with Pages Functions handling dynamic edge logic.

**Pattern:** Static-first marketing site (HTML pre-rendered at build, served from Cloudflare's edge cache), with a small set of server-rendered routes for dynamic logic (contact form, geo redirects, analytics ingestion). One repository, one deploy pipeline, one runtime environment.

---

## 1. Why this stack

| Concern | Choice | Why |
|---|---|---|
| Framework | **Astro 5** | Ships zero JS by default; React/Vue/Svelte islands when needed; first-party Cloudflare adapter. Next.js works but adds a React runtime to every page and depends on `@cloudflare/next-on-pages` shim. |
| Language | **TypeScript** | Type-safe content schemas, typed Workers env bindings, end-to-end DX. |
| Styling | **Tailwind v4** | Configured via Vite plugin and CSS `@theme` blocks — no JS config file, faster builds. |
| Hosting | **Cloudflare Pages** | Git-push deploys, unmetered bandwidth, global edge cache, native Functions integration. |
| Dynamic logic | **Pages Functions** (colocated in repo) | Same deploy pipeline as the site; no separate Worker to manage. Reserve standalone Workers for shared services consumed by multiple properties. |

---

## 2. Pages Functions vs. Workers — clearing this up

There are two ways to run server code on Cloudflare. They behave identically at runtime (both run on the Workers runtime) but differ in deployment pattern:

### Pages Functions
- Live inside the same repo as your site, in a `/functions/` directory OR as Astro API routes under `src/pages/api/`.
- Deploy automatically when the Pages project deploys. No separate Wrangler step.
- Routes map to URLs on your site (`functions/contact.ts` → `/contact`).
- **Use for:** form submissions, redirects, lightweight APIs scoped to this site.

### Standalone Workers
- Live in their own repo (or sub-package), deployed with `wrangler deploy`.
- Have their own URL or attach to a custom domain via Routes.
- Deploy independently of the Pages site.
- **Use for:** services shared across multiple sites, complex routing, anything you'd want to scale or version independently.

**This project uses Pages Functions exclusively.** Astro's adapter generates them automatically from `src/pages/api/*.ts` files marked `prerender = false`. You won't have a separate `/functions/` directory — Astro handles it.

If later you want a standalone Worker (e.g. a separate analytics ingest service), it lives in `workers/<name>/` as a sibling to the main app and is deployed with its own `wrangler.toml`. The blueprint below shows that structure even though we won't populate it on day one.

---

## 3. Project directory layout

```
alltech-site/
├── .github/                          # (optional) workflow files — NOT needed for Pages deploy
├── public/                           # Static assets served as-is
│   ├── favicon.svg
│   ├── robots.txt
│   └── og-default.png                # Open Graph image (1200×630)
│
├── src/                              # Astro frontend (static at build time)
│   ├── assets/                       # Imported assets (optimized by Astro)
│   ├── components/                   # Reusable .astro and .tsx components
│   │   ├── ContactForm.tsx           # React island (hydrated on the client)
│   │   ├── Header.astro              # Static — zero JS
│   │   ├── Footer.astro              # Static
│   │   ├── SEO.astro                 # <head> meta + OG + canonical
│   │   └── LocalBusinessSchema.astro # JSON-LD injected on every page
│   │
│   ├── layouts/
│   │   └── BaseLayout.astro          # Wraps every page; loads global CSS, header, footer
│   │
│   ├── pages/                        # File-based routing → URL paths
│   │   ├── index.astro               # /
│   │   ├── about.astro               # /about
│   │   ├── contact.astro             # /contact
│   │   ├── 404.astro                 # Custom 404
│   │   ├── services/
│   │   │   ├── index.astro                  # /services
│   │   │   ├── cloudflare-zero-trust.astro  # /services/cloudflare-zero-trust
│   │   │   └── [service].astro              # /services/<slug> (catch-all)
│   │   ├── locations/
│   │   │   └── [city].astro          # /locations/<city> (one per service area)
│   │   ├── insights/
│   │   │   ├── index.astro           # /insights
│   │   │   └── [...slug].astro       # /insights/<post-slug>
│   │   └── api/                      # ⭐ EDGE BACKEND lives here
│   │       └── contact.ts            # POST /api/contact → Pages Function
│   │
│   ├── content/                      # Type-safe content collections (Markdown/MDX)
│   │   ├── config.ts                 # Zod schemas for frontmatter
│   │   ├── blog/                     # .md / .mdx files
│   │   └── caseStudies/
│   │
│   ├── lib/
│   │   └── site.ts                   # Single source of truth: NAP, services, locations
│   │
│   ├── styles/
│   │   └── global.css                # Tailwind imports + @theme tokens + component classes
│   │
│   └── env.d.ts                      # Cloudflare runtime + Astro type augmentation
│
├── workers/                          # (NOT used day one — placeholder for future
│                                     #  standalone Workers, e.g. shared analytics ingest)
│
├── astro.config.mjs                  # Astro config — adapter, integrations, output mode
├── tsconfig.json                     # TypeScript config
├── wrangler.toml                     # Local dev simulation + Pages metadata
├── package.json
├── .gitignore
└── README.md
```

**Frontend vs. backend, visually:**
- Everything under `src/pages/*.astro` → static HTML at build time, served from edge cache
- Everything under `src/pages/api/*.ts` with `export const prerender = false` → runs as a Pages Function on the Workers runtime, per request
- Everything under `src/content/` → loaded at build time, becomes static HTML

The boundary is enforced by the `prerender` export. Astro reads it during the build, splits the output into static assets and a Functions bundle, and uploads both to Pages in one go.

---

## 4. Step-by-step initialization

These are the commands run from scratch. The scaffold I've already delivered is the result of executing them with our specific configuration.

### 4.1 Create the project

```bash
npm create astro@latest alltech-site
# Choose: Empty template (or "Basics" — we'll overwrite either way)
# TypeScript: Yes, strict
# Install dependencies: Yes
# Git: Yes

cd alltech-site
```

### 4.2 Add the Cloudflare adapter

```bash
npx astro add cloudflare
# Confirms changes to astro.config.mjs
# Installs @astrojs/cloudflare and Wrangler
```

This sets `adapter: cloudflare()` in `astro.config.mjs`.

### 4.3 Add Tailwind v4

```bash
npm install tailwindcss @tailwindcss/vite
```

Then edit `astro.config.mjs`:

```js
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // ...
  vite: { plugins: [tailwindcss()] },
});
```

Create `src/styles/global.css`:

```css
@import "tailwindcss";

@theme {
  --color-ink-900: #070d18;
  --color-accent-400: #00a8cf;
  /* ...tokens... */
}
```

Import it once from your base layout — done. No `tailwind.config.js` file, no `postcss.config.js`.

### 4.4 Add React for islands (optional, but used for the contact form)

```bash
npx astro add react
```

### 4.5 Add content collections, MDX, and sitemap

```bash
npx astro add mdx sitemap
```

### 4.6 Wire up Wrangler for local edge simulation

The Astro adapter already configures this. To run against the real Workers runtime locally (with bindings):

```bash
npm run build
npx wrangler pages dev ./dist
```

That serves your built site on `localhost:8788` using the real Workers runtime — Pages Functions execute exactly as they would in production. Use this to test `/api/contact` before deploy.

For the regular Astro dev server (no Workers runtime, faster iteration):

```bash
npm run dev   # localhost:4321
```

The Cloudflare adapter's `platformProxy.enabled: true` option (already set) means `locals.runtime` is also populated in dev mode, so most code paths work identically.

---

## 5. Configuration files

### 5.1 `astro.config.mjs`

```js
// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const SITE_URL = 'https://askalltech.com';

export default defineConfig({
  site: SITE_URL,

  // Astro 5 merged "hybrid" into "static". With output: 'static' and an adapter,
  // any route exporting `prerender = false` automatically becomes a Pages Function.
  // The rest pre-render to HTML at build time.
  output: 'static',

  adapter: cloudflare({
    imageService: 'compile',          // Build-time image optimization
    platformProxy: { enabled: true }, // Local dev mimics Workers runtime
  }),

  integrations: [
    react(),
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/api/'),
      changefreq: 'weekly',
      priority: 0.7,
    }),
  ],

  vite: { plugins: [tailwindcss()] },

  trailingSlash: 'never',
  build: { format: 'file' },
});
```

### 5.2 `wrangler.toml`

```toml
name = "alltech-site"
compatibility_date = "2025-09-01"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = "./dist"

# Bindings (KV, D1, R2) declared here as needed. Example:
# [[kv_namespaces]]
# binding = "CACHE"
# id = "your-kv-namespace-id"

# Secrets are NOT defined here. Set via Pages dashboard or:
#   npx wrangler pages secret put TURNSTILE_SECRET
```

### 5.3 `tsconfig.json`

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"],
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "baseUrl": ".",
    "paths": { "~/*": ["src/*"] }
  }
}
```

### 5.4 `package.json` scripts

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "wrangler pages dev ./dist",
    "deploy": "astro build && wrangler pages deploy ./dist",
    "typecheck": "astro check"
  }
}
```

### 5.5 Cloudflare Pages dashboard settings

After connecting the GitHub repo via Pages → Create application → Connect to Git, configure the build with:

| Setting | Value |
|---|---|
| **Framework preset** | Astro |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Root directory** | (leave blank) |
| **Production branch** | `main` |

Environment variables (Settings → Environment variables → Production):

| Variable | Type | Purpose |
|---|---|---|
| `NODE_VERSION` | Plain | `20` (or `22`) |
| `PUBLIC_TURNSTILE_SITE_KEY` | Plain | Cloudflare Turnstile site key (exposed to browser) |
| `TURNSTILE_SECRET` | **Secret** | Turnstile server-side verification |
| `RESEND_API_KEY` | **Secret** | If using Resend for transactional email |
| `CONTACT_FROM` | Plain | From address on form submissions |
| `CONTACT_FORWARD_TO` | Plain | Destination for form submissions |

Once configured, every `git push` to `main` triggers a deploy. Preview deployments are auto-created for every other branch and pull request.

---

## 6. Boilerplate

### 6.1 Static home page (excerpt)

`src/pages/index.astro`:

```astro
---
import BaseLayout from '~/layouts/BaseLayout.astro';
import { services } from '~/lib/site';
---

<BaseLayout
  title="Managed IT, Cybersecurity & Cloudflare Zero Trust"
  description="AllTech is a Cache Valley managed IT and cybersecurity provider."
>
  <section class="bg-ink-900 text-white py-24">
    <div class="container-wide">
      <h1 class="font-display text-6xl font-semibold">
        IT that actually <span class="text-accent-300">works</span>.
      </h1>
      <a href="/contact" class="btn btn-accent mt-8">Talk to an engineer →</a>
    </div>
  </section>

  <section class="py-20">
    <div class="container-wide grid sm:grid-cols-3 gap-4">
      {services.map((service) => (
        <a href={`/services/${service.slug}`} class="card">
          <h3 class="font-display text-xl">{service.name}</h3>
          <p class="text-ink-600">{service.short}</p>
        </a>
      ))}
    </div>
  </section>
</BaseLayout>
```

The full home page is in `src/pages/index.astro` of the delivered scaffold.

### 6.2 Edge function: contact form POST

`src/pages/api/contact.ts`:

```ts
import type { APIRoute } from 'astro';

// This single export is what tells Astro "render at request time on the edge,
// not at build time." The route becomes a Pages Function.
export const prerender = false;

interface ContactPayload {
  name?: string;
  email?: string;
  message?: string;
  company_website?: string;            // honeypot
  'cf-turnstile-response'?: string;
}

export const POST: APIRoute = async ({ request, locals, clientAddress }) => {
  let data: ContactPayload;
  try {
    data = await request.json();
  } catch {
    return json({ ok: false, message: 'Invalid JSON' }, 400);
  }

  // 1. Honeypot
  if (data.company_website) return json({ ok: true });

  // 2. Field validation
  if (!data.name?.trim() || !data.email?.trim() || !data.message?.trim()) {
    return json({ ok: false, message: 'Missing required fields' }, 400);
  }

  // 3. Access Cloudflare runtime env (bindings & secrets) via locals.runtime
  const env = locals.runtime.env;

  // 4. Turnstile verification (if configured)
  if (env.TURNSTILE_SECRET) {
    const verify = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: env.TURNSTILE_SECRET,
          response: data['cf-turnstile-response'] ?? '',
          remoteip: clientAddress,
        }),
      }
    );
    const result = await verify.json() as { success: boolean };
    if (!result.success) return json({ ok: false, message: 'Captcha failed' }, 400);
  }

  // 5. Forward — example with Resend (uncomment when ready)
  // await fetch('https://api.resend.com/emails', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     Authorization: `Bearer ${env.RESEND_API_KEY}`,
  //   },
  //   body: JSON.stringify({
  //     from: env.CONTACT_FROM,
  //     to: env.CONTACT_FORWARD_TO,
  //     reply_to: data.email,
  //     subject: `Web inquiry — ${data.name}`,
  //     text: data.message,
  //   }),
  // });

  return json({ ok: true });
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
```

**Key concepts shown:**
- `export const prerender = false` is the only signal Astro needs to deploy this as a Function.
- `locals.runtime.env` is how you reach Cloudflare bindings and secrets (typed via `src/env.d.ts`).
- `clientAddress` is the real client IP, made available by the adapter.
- Standard `fetch` and `Response` — no Cloudflare-specific APIs needed for the common case.

### 6.3 Geographic redirect (bonus pattern, not yet in the scaffold)

If you ever want to redirect Idaho visitors to a different landing page based on their location:

```ts
// src/pages/api/geo-redirect.ts (or middleware)
export const prerender = false;

export const GET: APIRoute = async ({ request, redirect }) => {
  const country = request.headers.get('cf-ipcountry');     // Cloudflare-injected
  const region  = request.cf?.region as string | undefined; // Workers runtime extras

  if (country === 'US' && region === 'Idaho') {
    return redirect('/locations/preston-id', 302);
  }
  return redirect('/', 302);
};
```

Cloudflare attaches `cf-ipcountry` and a rich `request.cf` object to every request hitting the Workers runtime — zero setup. Same pattern works for currency, language, A/B test bucket, etc.

---

## 7. The deploy pipeline, end to end

```
git push origin main
        │
        ▼
GitHub repo
        │
        ▼ (webhook to Cloudflare)
Cloudflare Pages build container
   - npm install
   - npm run build   (Astro builds static HTML + Pages Functions bundle)
        │
        ▼
Cloudflare global edge network
   - Static HTML served from cache (300+ POPs)
   - /api/* routes execute as Pages Functions on the Workers runtime
        │
        ▼
askalltech.com
```

No GitHub Actions. No separate Wrangler deploy step. Push → live in ~60 seconds.

---

## 8. What to wire up after deploy

In order of priority:

1. **Custom domain** — Pages → Custom domains → add `askalltech.com`. Cloudflare handles DNS and TLS.
2. **Environment variables & secrets** — set in Pages dashboard before the first form submission.
3. **Turnstile widget** — create a site at Cloudflare → Turnstile, paste keys into env vars.
4. **Cloudflare Web Analytics** — free, no cookie banner. Copy the token into `BaseLayout.astro` (script tag is already there, commented out).
5. **Email sender** — wire Resend (or Cloudflare Email Routing) into `src/pages/api/contact.ts`. Without this, form submissions are logged but not delivered.
6. **Google Search Console** — submit `https://askalltech.com/sitemap-index.xml`. Critical for local SEO.
7. **Google Business Profile** — verify NAP exactly matches `src/lib/site.ts`.

---

## 9. When to break out a standalone Worker

You don't need one for this site. But here's the rule of thumb for future:

| Scenario | Pages Function | Standalone Worker |
|---|---|---|
| Contact form for this site | ✅ | |
| Geo redirect for this site | ✅ | |
| Shared analytics ingest across multiple sites | | ✅ |
| Public API consumed by other apps | | ✅ |
| Cron job (scheduled trigger) | | ✅ |
| Durable Object backing real-time features | | ✅ |
| Heavy bundle that shouldn't bloat the site deploy | | ✅ |

Standalone Workers go in `workers/<name>/` with their own `wrangler.toml` and deploy with `wrangler deploy`. They can attach to the same domain via Routes if you want them at `api.askalltech.com/*` or similar.

---

## 10. Quick reference: the four "rules"

1. **One repo, one deploy.** Push to `main`, Pages handles everything.
2. **`prerender = false` is the only edge signal you need.** Astro routes default to static; opt out per-route to run on the edge.
3. **`locals.runtime.env` is your env.** Bindings and secrets are accessed identically in any Pages Function. Type them in `env.d.ts`.
4. **Static stays static.** Marketing pages, blog posts, location pages — never opt them into SSR. They're cached at the edge and serve in <50ms globally. Reserve dynamic rendering for the few routes that genuinely need it.

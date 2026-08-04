# AllTech website

Marketing site for AllTech — Astro + Tailwind v4 + React islands, deployed to Cloudflare Pages.

## Stack

- **Astro 5** — static-first, file-based routing, zero JS by default
- **Tailwind v4** — via the Vite plugin (no `tailwind.config.js`)
- **React 18** — hydrated islands where a component actually needs client interactivity (team grid, blog/case-study filtering and carousels, the interactive globe on the Cloudflare page); everything else stays static Astro/HTML
- **shadcn / shadcnblocks** — the `ui/` primitives and several page sections are pulled from the shadcnblocks registry (see "Design system" below)
- **MDX** — for blog posts and case studies
- **Cloudflare Pages** — hosting + edge SSR for `/api/contact`

## Local development

```bash
npm install
npm run dev          # http://localhost:4321
```

For local development of the contact form endpoint with the Cloudflare runtime:

```bash
npm run build
npm run preview      # runs `wrangler pages dev ./dist`
```

## Design system

Colors, spacing, radii, and shadows are defined once in `src/styles/global.css` and used everywhere else — don't hardcode hex values or one-off Tailwind color utilities in a page.

- **AllTech tokens** — a two-layer system at the top of `global.css`: raw SCALE tokens (`--color-ink-*`, `--color-amber-*`, `--color-teal-*`) and SEMANTIC tokens (`--color-bg-page`, `--color-text-default`, etc.) that reference them. Components should reference the semantic layer; the scale layer is the source of truth for hex values.
- **Dark mode** — a real light/dark toggle (`ThemeToggle.astro`, top-right of the header), not just the per-section `.surface-dark`/`.surface-inverse` styling that already existed. Persisted to `localStorage`, defaults to the OS preference, and applied before first paint via an inline script in `BaseLayout.astro` (no flash of the wrong theme). Every AllTech token above has a `.dark` override in `global.css` — when adding a new token, add its dark-mode value alongside it.
- **shadcn bridge** — a second token set (`--background`, `--primary`, `--muted`, etc.) lives in `global.css` so shadcn/shadcnblocks components resolve against this site's palette instead of shadcn's default slate. It's kept in sync with the shadcnblocks theme-registry export; see the comments directly above it in `global.css` before editing.
- **`@utility container`** — Tailwind's default `container` class ships with no horizontal padding. It's overridden in `global.css` to match `.container-wide`'s gutters, since shadcnblocks components are written against the stock class.

### Pulling a new shadcnblocks component

```bash
export SHADCNBLOCKS_API_KEY=<your key>   # requires a shadcnblocks.com subscription
npx shadcn@latest add @shadcnblocks/<block-name>
```

This fetches into `src/components/`. Treat the fetched file as a starting point, not a drop-in:

1. Swap any fictional/placeholder content (fake logos, stock photos, generic SaaS copy) for real AllTech content, or wire it to real data (content collections, `src/lib/site.ts`) if that exists.
2. Recolor from the block's own palette to the AllTech tokens above where it should match brand, unless the effect specifically depends on its own math (e.g. `.aurora-bg`'s blend-mode trick).
3. If the component has no real client-side interactivity (no state, no event handlers beyond what CSS/`:hover` already does), don't ship it as a React island — port the JSX to plain Astro/HTML. Several components in this repo (`GlobalBackground.astro`, the `.aurora-bg` CSS, the homepage hero) started as `.tsx` files and were rewritten this way.
4. Delete the raw fetched file once you've extracted what you need — don't leave duplicate/unused source sitting in `src/components/`.
5. The CLI sometimes rewrites `src/styles/global.css` when installing a themed block (adding `@theme`/`@theme inline` keys, occasionally re-declaring fonts or shadows). Diff the change before committing — see the warning comments already in that file about a couple of specific regressions this has caused before.

## Project structure

```
src/
├── components/        Shared Astro + React components (see ui/ for shadcn primitives)
├── content/           Content collections (blog, caseStudies)
│   ├── blog/          Markdown / MDX blog posts
│   ├── caseStudies/   Markdown / MDX case studies
│   └── config.ts      Typed frontmatter schemas
├── layouts/           BaseLayout.astro wraps all pages
├── lib/site.ts        Single source of truth: NAP, services, locations
├── lib/schema.ts      Shared JSON-LD builders (Service, FAQPage, BreadcrumbList)
├── pages/             File-based routes
│   ├── api/contact.ts SSR endpoint (only non-static route)
│   ├── locations/     Auto-generates a page per service-area city
│   ├── remote-it-support.astro  Location-agnostic "remote MSP" landing page
│   └── services/      One page per service
├── styles/global.css  Design tokens, dark mode, Tailwind theme, component classes
public/                Static assets (favicon, robots.txt, OG image, hero video)
```

## Adding content

### A new service

1. Add it to the `services` array in `src/lib/site.ts`. Services normally resolve to `/services/<slug>` via `serviceLink()`; if the page needs to live somewhere else (like `remote-it-support.astro`, at the site root), give the entry a `path` instead and `serviceLink()` will use that.
2. It will automatically appear in nav, footer, the home services grid, and get a placeholder page at `/services/<slug>` via the `[service].astro` catch-all.
3. To customize that service's page, create `src/pages/services/<slug>.astro` (or the page at whatever `path` you gave it) and add the slug to the exclusion list in `[service].astro`. Use `cloudflare-zero-trust.astro` as the template.
4. Use `src/lib/schema.ts`'s `buildServiceSchema` / `buildFaqSchema` / `buildBreadcrumbSchema` for that page's JSON-LD rather than hand-writing the object again — see any recently-added service page for the pattern. `REMOTE_AREA_SERVED` vs. the default `LOCAL_AREA_SERVED` decides whether the service claims to be deliverable outside the physical service area; only use `REMOTE_AREA_SERVED` for services that genuinely don't require an on-site visit.

### A new location

Add it to `serviceArea` in `src/lib/site.ts`. The page generates automatically from `src/pages/locations/[city].astro`.

### A blog post

Drop a markdown file in `src/content/blog/`. Frontmatter requirements are in `src/content/config.ts`. Set `draft: true` to hide it from the listing.

### A case study

Drop a markdown file in `src/content/caseStudies/`.

## Deployment

Cloudflare Pages, connected to the GitHub repo. Build settings in the Pages dashboard:

| Setting | Value |
|---|---|
| Framework preset | Astro |
| Build command | `npm run build` |
| Build output | `dist` |
| Root directory | (leave blank) |
| Node version env | `NODE_VERSION=20` |

Push to `main` → Pages builds and deploys automatically. No GitHub Actions.

### Environment variables

Set these in the Pages dashboard (Settings → Environment variables):

| Variable | Purpose |
|---|---|
| `PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile public key (exposed to browser) |
| `TURNSTILE_SECRET` | Turnstile secret (server-side verification) |
| `CONTACT_FROM` | From address (must be on a domain verified in Cloudflare Email Routing) |
| `CONTACT_FORWARD_TO` | Where contact form submissions are delivered |
| `ASSESSMENT_FORWARD_TO` | Where gap-assessment results are delivered (falls back to `CONTACT_FORWARD_TO`) |

`SHADCNBLOCKS_API_KEY` is only needed locally when pulling new blocks (see "Design system" above) — it's not used at runtime, so it doesn't need to be set in Pages.

## Contact form & security gap assessment

Both `/api/contact.ts` and `/api/assessment.ts` run as Cloudflare Pages Functions and:

1. Honeypot check (`company_website` field)
2. Required-field validation
3. Optional Turnstile verification (active once `PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET` are set)
4. Send via **Cloudflare Email Routing's Send Email binding** — see `src/lib/email.ts`. No third-party transactional provider (Resend, Postmark, etc.) needed. This binding **cannot be declared in `wrangler.toml`** — Pages projects fail config validation on a `[[send_email]]` block (Workers-only syntax) and every deploy breaks. Set it up entirely from the dashboard instead:
   - Add the binding: Workers & Pages → this project → Settings → Bindings → Add → Email → Send email → name it `SEND_EMAIL` (must match `src/env.d.ts`' `Env.SEND_EMAIL`).
   - Your domain must be added under Email Routing (dashboard → your zone → Email → Email Routing), with `CONTACT_FROM`'s domain verified there.
   - Every address you set `CONTACT_FORWARD_TO` / `ASSESSMENT_FORWARD_TO` to must also be added there **and** selected as an allowed destination on the binding itself — Cloudflare enforces that allow-list at the binding level, so it can't be driven purely by runtime env vars. Keep them in sync.
   - Without a working binding (e.g. running `astro dev` locally, or before the above is set up), submissions are still validated and scored — they just get logged instead of emailed.

## Before launch

- [ ] Replace `https://askalltech.com` in `src/lib/site.ts` and `astro.config.mjs` if domain changes
- [ ] Add the Cloudflare Web Analytics token in `BaseLayout.astro` (uncomment script tag)
- [ ] Generate `/public/og-default.png` (1200×630 brand image)
- [ ] Add the `SEND_EMAIL` binding via the Pages dashboard (NOT `wrangler.toml` — see "Contact form & security gap assessment" above), add your domain to Cloudflare Email Routing, verify `CONTACT_FROM`'s domain, and allow-list the real forward-to address(es) on the binding
- [ ] Set environment variables in Pages dashboard
- [ ] Verify Google Business Profile NAP exactly matches `site.ts`
- [ ] Submit `sitemap-index.xml` to Google Search Console
- [ ] Confirm the hero video (`public/hero-video.mp4`) is standard H.264 High Profile / yuv420p before replacing it — some export tools (including some Vecteezy/stock-footage downloads) default to a 4:2:2 profile that no browser can decode. `ffprobe -show_entries stream=profile,pix_fmt <file>` should report `High` and `yuv420p`.

## Open items from stakeholder meetings

Tracked here so they don't get lost between sessions. Pulled from the 7/31
website strategy meeting and a separate note from the install team manager.
Each is a business/content decision or needs something outside this
codebase (an account, a photo, a legal review) — none of these are
implemented yet.

- [x] **Non-customer inquiry flow.** `/contact` now splits into "already a
  customer" (client portal) vs. "new to AllTech" (the free security gap
  assessment) up top, mirroring the homepage hero's existing CTA pair.
- [ ] **Wire up real email delivery.** The code path is done — both
  `/api/contact.ts` and `/api/assessment.ts` send via Cloudflare Email
  Routing's Send Email binding (`src/lib/email.ts`), no third-party sender
  needed. What's left is account/dashboard setup, not code: add the
  `SEND_EMAIL` binding itself (Pages dashboard → Settings → Bindings —
  this can't go in `wrangler.toml` for a Pages project), add the domain to
  Email Routing, verify `CONTACT_FROM`'s domain, and allow-list the real
  forward-to address(es) — see "Contact form & security gap assessment" above.
- [ ] **Turnstile site key / secret.** Same category — `PUBLIC_TURNSTILE_SITE_KEY`
  and `TURNSTILE_SECRET` aren't set yet, so the captcha on the contact and
  assessment forms is currently inactive. The widget and server-side
  verification are already wired up in both forms; it just needs a
  Turnstile site created in the Cloudflare dashboard.
- [ ] **Client portal branding + wider access.** Only a limited set of
  clients currently have portal access; the meeting wants it broadened and
  visually matched to the site. External system (askalltech.itclientportal.com),
  not part of this repo.
- [ ] **AutoTask ticket integration** for assessment/contact submissions —
  external system integration, not started.
- [ ] **Bios** — team page bios need updating (Speaker 2).
- [ ] **Install photography** — real photos for the two new Install pages
  (`fiber-optic.astro`, `network-iot-cleaning.astro`, both currently a
  "Photos coming soon" placeholder block) and for existing Install pages
  generally.
- [ ] **Blog/Insights content** — Sean has content to contribute; a PAM
  (Privileged Access Management) post was mentioned as a likely next topic.
  Separately, Speaker 4 offered AI/SEO-oriented writing templates and advice
  (optimizing for AI-driven search, not just traditional SEO) — worth
  following up on before writing more posts.
- [ ] **Off-site AI-visibility signals** — a first on-site pass (remote-MSP
  positioning, `Service`/`FAQPage`/`BreadcrumbList` schema, see
  `remote-it-support.astro` and `src/lib/schema.ts`) is done, but nothing
  off-site could be changed from this repo: Google Business Profile /
  Bing Places service-area settings, directory NAP consistency, and
  `site.ts`'s `social` object (still empty — populate once real
  LinkedIn/Facebook/directory URLs exist, then wire them into
  `LocalBusinessSchema.astro`'s `sameAs` array).
- [ ] **Legal review** of the Terms of Use, Privacy Policy, and the new
  Master Services Agreement page (`src/pages/legal/master-services-agreement.astro`,
  deliberately not linked from any nav — direct-link only). The MSA is a
  **template** with unfilled placeholders (Provider legal name, term
  length, AUP URL, notice email) reproduced as-is; don't share the link
  with a prospect as a ready-to-sign document until it's been reviewed and
  those blanks are resolved, ideally per-engagement via the Order Form
  process the agreement itself describes rather than hardcoded here.
- [ ] **Licensing research** for low-voltage/install work in states with
  their own requirements (e.g. California's C7) before advertising
  national reach for install services.
- [ ] **"What We Don't Do" section** — several service pages already have
  ad hoc versions of this (see `email-security.astro`,
  `incident-response.astro`), but there's no sitewide reusable section.
  Needs specifics on what's actually wrong with the current copy before
  editing it.
- [ ] **About Us page** — content/inclusion still undecided per the
  meeting.
- [ ] **Logo color** — meeting floated recoloring `logo.webp` to match the
  blue-grey theme, but also noted internal resistance to changing it.
  `logo.webp` is a flat raster image with no CSS-based recoloring path
  (not an SVG using `currentColor`/`fill`), so this needs either a new
  pre-colored asset or a decision to convert it to SVG, not an automatic
  edit.
- [ ] **"Fat Boy" client logo** — needs the actual logo file added to
  `public/logos/` and to `ClientLogos.astro`'s `clients` array.
- [ ] **"Network security" as a distinct service** — floated in the
  meeting, but this already overlaps with Network Detection (NDR, under
  Cybersecurity) and Firewall & Routing (under Network). Recommend against
  a redundant page unless there's a specific gap those two don't cover.

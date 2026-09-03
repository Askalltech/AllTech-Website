# AllTech website

Marketing site for AllTech — Astro + Tailwind v4 + React islands, deployed to Cloudflare Workers (with static assets), not classic Cloudflare Pages — see "Deployment" below.

## Stack

- **Astro 5** — static-first, file-based routing, zero JS by default
- **Tailwind v4** — via the Vite plugin (no `tailwind.config.js`)
- **React 18** — hydrated islands where a component actually needs client interactivity (team grid, blog/case-study filtering and carousels, the interactive globe on the Cloudflare page); everything else stays static Astro/HTML
- **shadcn / shadcnblocks** — the `ui/` primitives and several page sections are pulled from the shadcnblocks registry (see "Design system" below)
- **Markdown content collections** — blog posts and case studies (plain `.md`, not MDX)
- **Cloudflare Workers** — hosting (static assets + the Worker runtime), edge SSR for `/api/contact` and `/api/assessment`

## Local development

```bash
npm install
npm run dev          # http://localhost:4321
```

For local development of the contact form endpoint with the Cloudflare runtime:

```bash
npm run build
npm run preview      # runs `wrangler dev` against the built ./dist output
```

Environment variables: copy `.env.example` → `.env.local` (build-time vars) and
`.dev.vars.example` → `.dev.vars` (runtime secrets read by `wrangler dev`). Both
copies are gitignored. Everything is optional for local dev — the forms stay
usable with nothing set. See "Environment variables" below for the full split.

## Design system

Colors, spacing, radii, and shadows are defined once in `src/styles/global.css` and used everywhere else — don't hardcode hex values or one-off Tailwind color utilities in a page.

- **AllTech tokens** — a two-layer system at the top of `global.css`: raw SCALE tokens (`--color-ink-*`, `--color-amber-*`, `--color-teal-*`) and SEMANTIC tokens (`--color-bg-page`, `--color-text-default`, etc.) that reference them. Components should reference the semantic layer; the scale layer is the source of truth for hex values.
- **Dark mode** — a real light/dark toggle (`ThemeToggle.astro`, top-right of the header), not just the per-section `.surface-dark`/`.surface-inverse` styling that already existed. Persisted to `localStorage`, defaults to the OS preference, and applied before first paint via an inline script in `BaseLayout.astro` (no flash of the wrong theme). Every AllTech token above has a `.dark` override in `global.css` — when adding a new token, add its dark-mode value alongside it.
- **shadcn bridge** — a second token set (`--background`, `--primary`, `--muted`, etc.) lives in `global.css` so shadcn/shadcnblocks components resolve against this site's palette instead of shadcn's default slate. It's kept in sync with the shadcnblocks theme-registry export; see the comments directly above it in `global.css` before editing.
- **`@utility container`** — Tailwind's default `container` class ships with no horizontal padding. It's overridden in `global.css` to match `.container-wide`'s gutters, since shadcnblocks components are written against the stock class.
- **`.surface-light` stays light in dark mode, on purpose** — it's an intentional bright "interlude" band breaking up dark pages, not a themed section (see the `--color-bg-inverse` comment in `global.css`). A card placed inside one should use the same light-constant tokens `.surface-light .card` already does (`background: white; border-color: var(--color-ink-100)`), not the page-level `--color-bg-surface`/`--color-border-subtle` tokens — those are theme-relative and will render as a near-invisible dark box on the light band in dark mode. (This exact bug shipped once on the `/locations` pages and had to be fixed.)
- **Mega-menu panel positioning** — `.mega-zone` has no `position: relative` of its own; a panel's `left-1/2` centers on the whole `.nav-host` bar by default (harmless for the wide Services panel, which fills most of the bar anyway). A **narrow** panel (Industries, Company) needs the `mega-zone-self` modifier class on its `.mega-zone` wrapper, or it renders visibly detached from its own trigger and — because the trigger's hoverable box has no width beyond the link itself — closes before the mouse can reach it, making the dropdown effectively unclickable.

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
│   ├── Header.astro   Nav — Services / Industries / Company mega-menus + mobile accordion
│   ├── SqueezeCarousel.tsx  The industry-carousel widget (src/pages/industries.astro)
│   └── BorderBeamPanel.tsx  Animated-border wrapper, currently only on the homepage hero CTA
├── content/           Content collections (blog, caseStudies)
│   ├── blog/          Markdown blog posts (plain .md, not MDX)
│   ├── caseStudies/   Markdown case studies
│   └── config.ts      Typed frontmatter schemas
├── layouts/           BaseLayout.astro wraps all pages
├── lib/site.ts        Single source of truth: NAP, services, locations
├── lib/menu.ts        Nav data: Services mega-menu categories, Company dropdown links
├── lib/industries.ts  The 6 client industries — shared by the Industries nav dropdown
│                      AND src/pages/industries.astro (same data, single source)
├── lib/schema.ts      Shared JSON-LD builders (Service, FAQPage, BreadcrumbList)
├── pages/             File-based routes
│   ├── api/contact.ts SSR endpoint (only non-static route)
│   ├── industries.astro  "Who we support" — moved off the homepage; nav links land here
│   ├── locations/     index.astro (city directory) + [city].astro (auto-generated per city)
│   ├── remote-it-support.astro  Location-agnostic "remote MSP" landing page
│   └── services/      One page per service
├── styles/global.css  Design tokens, dark mode, Tailwind theme, component classes
public/                Static assets (favicon, robots.txt, OG image, hero video)
│   └── _redirects     301s for renamed routes (currently: one renamed insights slug)
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

**This is a Cloudflare Worker (with a static-assets binding), not classic Cloudflare Pages** — `wrangler.toml` defines `name`, `main` (`./dist/_worker.js/index.js`), and an `[assets]` block pointing at `./dist`. Deploy is `astro build && wrangler deploy` (see the `deploy` script in `package.json`).

The Worker is connected to this GitHub repo via **Cloudflare Workers Builds** (Workers & Pages → this Worker → the connected-repo build pipeline, not the legacy Pages product). Every push builds automatically — but **only commits on `main` get promoted to live traffic automatically**; builds from other branches (e.g. a feature branch merged later) show up under that Worker's "Versions" tab as a built-but-inactive version. If a merge to `main` doesn't show up live, check Workers & Pages → this Worker → Deployments: the latest version may need a manual "Deploy"/promote click, or the `wrangler.toml` `name` may be out of sync with what the CI expects (this happened once already — CI silently overrides a mismatched `name` and opens an auto-PR to fix it; check the build log for a `Failed to match Worker name` warning).

No GitHub Actions — the build/deploy pipeline is entirely Cloudflare's own Workers Builds, triggered by the git connection.

### Environment variables

There are **three** different places a variable can live, and picking the
wrong one is the single most common way to break the forms. The difference
is *when* the value is read:

| Variable | Kind | Where it goes |
|---|---|---|
| `PUBLIC_TURNSTILE_SITE_KEY` | **Build-time** | Settings → **Builds** → Variables and secrets |
| `TURNSTILE_SECRET` | Runtime **secret** | Settings → Runtime variables and secrets (as a Secret) |
| `RESEND_API_KEY` | Runtime **secret** | Settings → Runtime variables and secrets (as a Secret) |
| `CONTACT_FROM` | Runtime plain var | **`wrangler.toml` `[vars]`** (committed) |
| `CONTACT_FORWARD_TO` | Runtime plain var | **`wrangler.toml` `[vars]`** (committed) |
| `ASSESSMENT_FORWARD_TO` | Runtime plain var | **`wrangler.toml` `[vars]`** (falls back to `CONTACT_FORWARD_TO`) |

- **Build-time** (`PUBLIC_*`) is read through `import.meta.env`, so Vite bakes
  it into the compiled output during `astro build`. Setting it as a *runtime*
  variable does nothing — the built HTML simply won't contain the Turnstile
  widget. It also needs a **rebuild** (not just a redeploy) to take effect.
  This exact mistake is why the captcha silently didn't render at first.
- **Runtime secrets** are read via `locals.runtime.env.X` at request time.
  Cloudflare stores Secrets separately from the script, so they **survive**
  a Workers Builds redeploy.
- **Runtime plain vars** are part of the uploaded script config, so Workers
  Builds **wipes any set only in the dashboard** on the next push. That's why
  they're declared in `wrangler.toml` instead. Never put a secret there — it's
  committed to git.

`SHADCNBLOCKS_API_KEY` is only needed locally when pulling new blocks (see "Design system" above) — it's not used at runtime, so it doesn't need to be set on the Worker.

## Contact form & security gap assessment

Both `/api/contact.ts` and `/api/assessment.ts` run as routes on the Worker itself (Astro's SSR endpoints, not Cloudflare Pages Functions) and:

1. Honeypot check (`company_website` field)
2. Required-field validation
3. Optional Turnstile verification (active once `PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET` are set)
4. Send via **Resend's REST API** — see `src/lib/email.ts` (a plain `fetch`
   to `https://api.resend.com/emails`; no SDK, so nothing Node-specific has
   to run on the Worker).

**Why Resend and not Cloudflare's own Send Email binding.** That binding
requires Cloudflare **Email Routing**, which in turn requires Cloudflare to
be authoritative for the domain's **MX** records. `askalltech.com`'s MX
already points at **Cloudflare Email Security**, which fronts the live
company mailbox (Microsoft 365) — taking over MX for Email Routing would have
broken real inbound mail. (Email Security and Email Routing are different
products and can't both own MX.) Sending, by contrast, is authorized by
**SPF/DKIM** (TXT/CNAME), never MX, so Resend coexists with the existing
setup untouched. `wrangler.toml` therefore declares no `[[send_email]]`
binding.

Setup, once:
   - Add and verify a sending domain in Resend. We use the subdomain
     **`mail.askalltech.com`** rather than the apex: the apex already has an
     SPF record with three includes under a `p=quarantine` DMARC policy, and
     only one SPF TXT record per domain is valid — a subdomain gets its own
     independent SPF/DKIM and can't disturb the apex.
   - Set `CONTACT_FROM` to an address on that verified subdomain
     (`noreply@mail.askalltech.com`). The forward-to addresses are ordinary
     inboxes and need no verification — unlike the Cloudflare binding, Resend
     has no destination allow-list to keep in sync.
   - Store `RESEND_API_KEY` as a **Secret** (see the table above).
   - Without a key (e.g. running `astro dev` locally), submissions are still
     validated and scored — they just get logged instead of emailed.

## Before launch

> **Cutting the domain over? See [LAUNCH-CHECKLIST.md](./LAUNCH-CHECKLIST.md).**
> That file is the ordered runbook for pointing `askalltech.com` at this build
> — Worker routing, the Turnstile hostname allow-list, redirects for the 15 old
> WordPress URLs, and what to verify afterwards. The list below is the older,
> broader pre-launch backlog and overlaps with it.


- [ ] Replace `https://askalltech.com` in `src/lib/site.ts` and `astro.config.mjs` if domain changes
- [ ] Add the Cloudflare Web Analytics token in `BaseLayout.astro` (uncomment script tag)
- [x] Generate `/public/og-default.png` (1200×630 brand image) — done; wired up as the default `image` in `src/components/SEO.astro`
- [ ] Verify the Resend sending domain and store `RESEND_API_KEY` as a Secret — see "Contact form & security gap assessment" above
- [ ] Set the remaining environment variables, each in the right place (see the three-way table under "Environment variables" — build-time vs. secret vs. `wrangler.toml` `[vars]`)
- [ ] Send one real end-to-end test submission through `/contact` and confirm it lands in the shared inbox
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
- [x] **Wire up real email delivery.** Done in code and configuration:
  `/api/contact.ts` and `/api/assessment.ts` send via Resend
  (`src/lib/email.ts`), the `mail.askalltech.com` sending domain is verified,
  and `RESEND_API_KEY` is stored as a Secret. What remains is a single real
  end-to-end test submission to confirm delivery to the shared inbox.
- [ ] **Turnstile site key / secret.** `TURNSTILE_SECRET` is set as a
  Secret, but `PUBLIC_TURNSTILE_SITE_KEY` must be added under Settings →
  **Builds** → Variables and secrets (it's build-time, not runtime — see
  "Environment variables") and the Worker rebuilt. Until that rebuild runs,
  the captcha doesn't render at all. Verified: a build with the var present
  takes the Turnstile script tag from 0 to 1 on both `/contact` and
  `/assessment`.
- [ ] **Client portal branding + wider access.** Only a limited set of
  clients currently have portal access; the meeting wants it broadened and
  visually matched to the site. External system (askalltech.itclientportal.com),
  not part of this repo.
- [ ] **AutoTask ticket integration** for assessment/contact submissions —
  external system integration, not started.
- [ ] **Bios** — team page bios need updating (Speaker 2).
- [x] **Install page tile photography.** All 7 capability tiles on
  `/services/install` and the 7 matching tiles on
  `/services/cloudflare-zero-trust` now have real (Unsplash-sourced,
  credited) photos via `Services21Item`'s `image`/`photoCredit` fields.
- [ ] **Install photography — in-page galleries.** Separate from the tile
  photos above: `fiber-optic.astro` and `network-iot-cleaning.astro` each
  still have a "Photos coming soon" placeholder block further down the
  page (a real project-photo gallery, not the capability tile).
- [ ] **Blog/Insights content.** The VPN migration post
  (`retiring-the-corporate-vpn.md`, now live at
  `/insights/cloudflare-zero-trust-vpn-migration`) was rewritten with a
  full case-study treatment. A PAM (Privileged Access Management) post was
  separately mentioned as a likely next topic — not started. AI/SEO
  writing templates were also offered for future posts — worth following
  up before writing more.
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
- [ ] **`.text-muted` on `.surface-light` is borderline low-contrast in
  dark mode** — found during a full dark-mode audit. It's a light
  gray-blue on a white "interlude" card (see the `.surface-light` note
  under "Design system"), likely under WCAG AA for body text. Pre-existing
  across several service pages (e.g. `cybersecurity.astro`'s "Not a
  reseller. Not a silo." section), not something introduced recently —
  flagged but not changed, since fixing it site-wide is a design decision
  (a new token, or a different class for muted text inside light bands)
  rather than a one-line patch.
- [ ] **`BorderBeamPanel.tsx` / `SqueezeCarousel.tsx` adoption.**
  Community components adapted in as trials: `BorderBeamPanel` currently
  wraps only the homepage hero's primary CTA (an animated conic-gradient
  border ring); `SqueezeCarousel` powers `/industries`. Decide whether
  either should be reused elsewhere or is a one-off trial worth reverting.
  Both `.tsx` files carry provenance/adaptation notes at the top.

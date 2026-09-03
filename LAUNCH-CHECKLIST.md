# Domain cutover checklist

Everything that has to happen when `askalltech.com` stops serving the old
WordPress/Elementor site and starts serving this Astro build.

Written 2026-09-03, while the new site was live only at
`development-preview.askalltech.com`. Item 4 is already done; everything else
is outstanding.

**Order matters.** Items 1–3 are hard blockers: skip any one and the site is
either unreachable or silently rejecting every form submission. Do 1–5 before
flipping DNS, 6–9 immediately after, 10–13 in the following days.

---

## Before the flip

### 1. Route the production domain to the Worker

`wrangler.toml` currently routes only the preview host:

```toml
routes = [
  { pattern = "development-preview.askalltech.com", custom_domain = true }
]
```

Add `askalltech.com` as a custom domain on the Worker. Decide whether the
preview host stays (useful for staging) or goes. If it stays, it keeps
serving `Disallow: /` automatically — see item 6.

### 2. Add the production hostname to the Turnstile widget

**This one fails closed and takes both forms down with it.**

Turnstile site keys are scoped to a hostname allow-list. The widget currently
accepts `development-preview.askalltech.com`. If `askalltech.com` is not added
to the same Turnstile site, tokens fail validation on the live domain — and
`src/lib/turnstile.ts` deliberately fails CLOSED, so `/contact` and
`/assessment` would reject every genuine submission with a captcha error.

Cloudflare dashboard → Turnstile → the site → add the hostname.

### 3. Confirm the rotated Resend key is in the Worker

`RESEND_API_KEY` was rotated on 2026-09-03. Confirm the **new** value is
stored under Settings → Runtime variables and secrets (as a Secret, not a
plain var). If it's stale, both form endpoints return 502.

Send one real submission through `/contact` on the live domain afterwards and
confirm it lands in `hello@askalltech.com`. The assessment form was tested
successfully before the rotation; contact has never completed an end-to-end
send.

### 4. ~~Add redirects for the 15 old WordPress URLs~~ — DONE

Implemented and verified 2026-09-03. All 15 legacy URLs resolve in a single
hop; nothing 404s at cutover.

*   13 legacy paths 301 to their equivalent here. Mappings live in the
    "Legacy WordPress URLs" block in `astro.config.mjs`; the trailing-slash
    forms (which is how the old site actually linked and indexed them) are in
    `public/_redirects` so they resolve in one hop instead of two.
*   `/services/home-phone/` and `/services/internet-service-alltech-fiber/`
    return **410 Gone** — both product lines are retired (confirmed with the
    team) and have no equivalent, so a 301 would send people to a page that
    doesn't sell what they came for. Each renders a real explanatory page with
    onward links rather than a bare status code. Note `/services/fiber-optic`
    is fiber *installation*, not internet service — do not "fix" the fiber 410
    by pointing it there.

Nothing to do at cutover. **Re-verify against production once DNS moves:**

```bash
for p in /about-us/ /contact-us/ /services/alltech-cyber-security/ \
         /mtr-management-threat-response/ /services/home-phone/; do
  curl -sS -o /dev/null -w "$p -> %{http_code} %{num_redirects} hop(s) %{url_effective}\n" \
    -L "https://askalltech.com$p"
done
```

Expect 200 in 1 hop for the first four and 410 for the last.

### 5. Merge to `main`

Cloudflare Workers Builds auto-promotes **only `main`**. Work currently sits
on `alltech-development-ERP5`. Builds from other branches appear under the
Worker's Versions tab as built-but-inactive and need a manual promote.

---

## Immediately after the flip

### 6. Verify robots.txt flipped

`src/pages/robots.txt.ts` switches itself by `Host` — no edit needed. Confirm:

```bash
curl -sS https://askalltech.com/robots.txt                     # full policy + Sitemap:
curl -sS https://development-preview.askalltech.com/robots.txt # Disallow: /
```

If production shows `Disallow: /`, the host comparison is failing — check
`PRODUCTION_HOST` against `site.url`.

### 7. Confirm Cloudflare's managed robots.txt is still OFF

Disabled 2026-09-03. If it is ever re-enabled it **prepends**
`User-agent: GPTBot → Disallow: /` (plus ClaudeBot, Google-Extended, CCBot,
Bytespider, Amazonbot, Applebot-Extended, meta-externalagent) above our file.
A named user-agent group overrides `User-agent: *`, so its block wins and
every generative-search objective silently dies. Zone → AI Crawl Control.

Re-check this after any Cloudflare plan change or zone setting sweep.

### 8. Verify the canonical tags point at the live domain

Canonicals are built from `site.url` in `src/lib/site.ts`, already
`https://askalltech.com`. Spot-check a few pages — while the preview host was
the only live one, every page canonicalised to a domain serving WordPress.

### 9. Spot-check the forms and a redirect

One `/contact` submission, one `/assessment` submission, and two or three of
the old URLs from item 4.

---

## Within the first week

### 10. Google Search Console

- Submit `https://askalltech.com/sitemap-index.xml` (**not** `sitemap.xml` —
  `@astrojs/sitemap` emits an index).
- Remove or leave the old `sitemaps.xml` to 404; do not resubmit it.
- Watch Coverage for 404 spikes — that's the signal item 4 missed a URL.
- The old site ran Google Site Kit. Confirm the property still verifies after
  the WordPress install is gone; the verification method may have been a
  plugin-injected tag that disappears with it.

### 11. Turn on Cloudflare Web Analytics

The script tag is commented out in `src/layouts/BaseLayout.astro` pending a
token. There is currently **no analytics on the new site at all**, so without
this there's no baseline to compare pre/post-launch traffic against. Worth
doing before the flip if you want clean before/after numbers.

### 12. Re-run the crawl checks against production

The pre-launch audit ran against the preview host:

```
0 broken links · 0 missing assets · 66 pages · 0 JS errors
0 meta descriptions > 170 chars · 0 titles > 60 chars · 169 JSON-LD blocks valid
```

Re-run on the live domain. Also validate the homepage `@graph` in Google's
Rich Results Test now that its `@id`s resolve to real URLs.

### 13. Decommission the old site deliberately

Don't delete the WordPress install until the redirects are confirmed working
and Search Console shows the new URLs indexed. Keep a backup regardless.

Also: `php.askalltech.com` showed up in Cloudflare's AI crawler stats as the
most-crawled path (`/sitemap.xml`, 19 requests). Find out what that subdomain
is. If it's a leftover of the WordPress stack it should be retired too —
right now it's the thing AI crawlers see most of AllTech.

---

## Open items not blocking launch

- **`sameAs` is empty** in `src/lib/site.ts` (social profiles commented out).
  This is the cheapest remaining GEO win — entity disambiguation leans heavily
  on `sameAs`. Add LinkedIn, Facebook, and the Google Business Profile URL.
- **Google Business Profile NAP** must match `site.ts` exactly — same street
  format, same phone punctuation.
- **Hero video codec unverified.** `public/hero-video.mp4` should be H.264
  High / `yuv420p`; some stock exports default to a 4:2:2 profile no browser
  decodes. `ffprobe -show_entries stream=profile,pix_fmt public/hero-video.mp4`
  (no `ffprobe` was available in the session that wrote this).
- **29 page titles are under 50 characters.** Deliberately left short rather
  than padded with filler; revisit only if you want location keywords in them.
- **Rotate the Cloudflare API token** pasted into chat on 2026-09-03, if not
  already done.

---

## Things that need NO action at cutover

Recorded so nobody "fixes" them later:

- **robots.txt** switches on `Host` by itself (item 6).
- **The two `noindex` tags are correct.** `/404` and
  `/legal/master-services-agreement` — the latter is an unsigned MSA template
  with unfilled blanks awaiting legal review, deliberately unlisted and
  excluded from the sitemap filter. Do not strip them; see `claude.md` §7A.
- **`rel="nofollow"` on outbound photo credits** is attribution, not crawl
  control. Leave it.
- **The GEO scrape zone is homepage-only, on purpose.** All 66 pages share
  `BaseLayout`, so moving it there would duplicate it across every URL.
  See `claude.md` §7E.

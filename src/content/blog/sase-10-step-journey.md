---
title: "The 10-Step SASE Framework, and Which Steps Actually Apply to You"
description: "Cloudflare's 10-step SASE maturity framework was written for enterprises. Here's what it actually maps to for a small or mid-sized business, and where most organizations should realistically stop."
pubDate: 2026-08-27
author: "AllTech"
heroImage: "/insights/sase-10-step-journey.webp"
heroImageCredit:
  name: "Max Petrunin"
  url: "https://unsplash.com/photos/abstract-blue-lines-and-dots-on-black-background-KKx5r-w1dPo"
tags: ["cloudflare", "zero trust", "sase", "cybersecurity", "networking"]
---

"SASE" (secure access service edge) shows up in vendor material as both an architecture and a sales pitch, which makes it hard to tell what any of it actually requires you to do. Cloudflare's ebook, *Achieving SASE Success: 10 Key Milestones to Get It Right*, lays out a 10-step maturity framework across three phases that's useful less as a Cloudflare product tour and more as an honest map of the order these problems tend to get solved in.

We're citing it here — with the same caveat as always — because it's Cloudflare's published material, not AllTech's independent research. What follows is our read on which of those 10 steps actually apply once you're not a multi-thousand-employee enterprise, and where most of our clients realistically stop.

## The framework, briefly

Cloudflare's ebook organizes the 10 steps into three phases:

**Phase 1 — Modernize remote access:** clientless ZTNA for your riskiest users first, then MFA/identity/device-posture enforcement, then full VPN retirement.

**Phase 2 — Modernize security:** layering web and email threat protection, extending data-loss controls across SaaS and AI tools, then consolidating access/threat/data controls into one platform.

**Phase 3 — Modernize networking and security:** simplifying branch connectivity, extending controls to multi-cloud environments, eliminating private MPLS circuits, and removing the last IP-based "trusted network" assumptions entirely.

The framework cites the same Enterprise Strategy Group (ESG) research behind Cloudflare's VPN-replacement material — 76% of organizations have replaced or plan to replace VPN with ZTNA, and 98% of IT security decision-makers agree that app-level access matters more than network-level access. It's the same underlying pattern we wrote about in [the business case for VPN replacement](/insights/vpn-replacement-business-case): Phase 1 of this framework and that VPN-replacement conversation are, in practice, the same project.

## Where this framework was written for a different scale

Cloudflare's own case studies illustrate the framework with examples like Indeed (deprecating an enterprise VPN across a global workforce in about three months), Werner Enterprises (cutting malicious email volume by more than half across a national workforce), and THG (migrating 7,000+ hybrid workers off a competing SSE platform). Later phases talk about eliminating MPLS circuits between branch offices and onboarding traffic from AWS, GCP, and Azure simultaneously.

None of that is invalid — it's just describing organizations with multiple offices, dedicated network teams, and infrastructure most of our clients don't have and don't need. If you're a 15-person office or a single-location business in Cache Valley, phases involving multi-cloud orchestration and private circuit elimination aren't a maturity gap you're behind on. They're steps built for a different kind of organization entirely.

The useful part of this framework for a smaller business isn't "complete all 10 steps." It's the order: it tells you which problem to solve first, second, and third, and roughly when a given fix stops being worth the complexity it adds.

## What actually maps to a small or mid-sized business

**Steps 1–3 (Phase 1) apply to almost everyone.** Clientless access for your highest-risk users — contractors, third parties, anyone touching sensitive data without being on a company-managed device — is close to universally worth doing, and it's the same starting point we recommend regardless of company size. Enforcing MFA and identity-based policy is table stakes at this point, not a maturity milestone. Full VPN retirement is worth doing once you've validated which applications actually still need it — which is the entire subject of [our phased VPN migration walkthrough](/insights/cloudflare-zero-trust-vpn-migration).

**Steps 4–6 (Phase 2) apply selectively.** Web and email threat filtering is broadly relevant — most of our clients already have some version of this through Microsoft 365 or Google Workspace, and the question is usually whether it needs augmenting, not whether to start from zero. Data-loss prevention across SaaS and AI tools (Cloudflare's step 5) is real and growing in relevance as staff start pasting company data into ChatGPT, but it's not the first thing worth spending budget on if steps 1–2 aren't done yet. Consolidating access, threat, and data controls onto one platform (step 6) is a genuine efficiency play for organizations already running several point products — for a smaller shop that never had five separate security vendors to begin with, there's less to consolidate.

**Steps 7–10 (Phase 3) rarely apply below a certain size.** Branch connectivity, MPLS circuit elimination, and multi-cloud orchestration assume multiple physical locations or multi-cloud infrastructure. Most small and mid-sized organizations we work with have one or two physical sites and a single cloud provider, if any. That's not a gap — it's a smaller problem than the framework is solving for.

## The pattern that does carry over regardless of size

Two things in this framework hold at any scale, and they're the actual takeaway worth keeping:

**Sequence risk-reduction ahead of convenience.** Every phase in Cloudflare's framework front-loads the highest-risk, highest-value problem (risky-user access, then threat filtering, then network exposure) before the lower-urgency ones. That's a reasonable default for a five-person IT shop deciding what to fix first, not just a 10,000-employee enterprise deciding what to fix next.

**Consolidation has a real ceiling on value.** The framework's own logic (steps 6 and 10) is that piling on point products eventually costs more in management overhead than it protects. That's true whether you're consolidating five platforms into one or deciding not to buy a sixth tool your five-person team can't realistically manage. Recognizing that ceiling early is worth more than chasing every step on the list.

## Where this leaves you

If you're evaluating whether your organization is "behind" on SASE, the more useful question is which of the first three or four steps you've actually done — not whether you've reached step 10. Most small and mid-sized organizations get real, measurable risk reduction from Phase 1 and the security-hygiene parts of Phase 2, and never need Phase 3 at all.

AllTech is a Cloudflare partner and scopes exactly this kind of assessment for clients across Northern Utah: what's already covered, what the next real priority is, and — just as importantly — which parts of a framework built for enterprise scale you can reasonably skip.

---

**Source note:** The framework, statistics, and case-study summaries referenced in this article are drawn from Cloudflare's ebook, *Achieving SASE Success: 10 Key Milestones to Get It Right*, including research commissioned from Enterprise Strategy Group (ESG) and a Forrester Consulting cost-benefit study cited within that publication. AllTech has independently adapted and commented on this material for smaller organizations evaluating their own security posture.

**Disclosure:** AllTech is a Cloudflare partner. Our recommendations are based on each client's applications, identity environment, security requirements, and operational constraints — not on any one vendor's material.

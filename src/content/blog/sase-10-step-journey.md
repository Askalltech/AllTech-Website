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

We're citing it here — with the same caveat as always — because it's Cloudflare's published material, not AllTech's independent research. The milestones are a planning framework, not a requirement to buy every control or complete every phase. What follows is our read on which of those 10 steps actually apply once you're not a multi-thousand-employee enterprise, and where most of our clients realistically stop.

## The framework, briefly

Cloudflare organizes the journey into three phases. Phase 1 modernizes remote access: start with clientless ZTNA for selected users, expand it to more applications while strengthening identity, MFA, device posture, and risk signals, and retire VPN access where it's no longer needed. Phase 2 modernizes security: improve web and email defenses, protect data across SaaS, cloud, and AI use, and reduce tool sprawl by consolidating controls. Phase 3 modernizes networking and security: simplify branch connectivity, secure cloud environments, reduce reliance on private circuits, and eliminate remaining IP-based assumptions of trust.

Cloudflare's ebook cites ESG research indicating that 76% of organizations have replaced VPN access with ZTNA or plan to do so, and that 98% of IT security decision-makers agree that connecting users directly to the applications they need matters more than broad network access. That's a different figure than the 74% we cited in [the business case for VPN replacement](/insights/vpn-replacement-business-case) — both trace back to the same named ESG study, "Considerations for Implementing Zero Trust for the Workforce" (July 2024), but we're treating them as separate reported figures rather than assuming they're interchangeable.

Not every organization needs a full SASE program, either. Cloudflare's ebook notes that the web, SaaS, data-protection, and application-access portions of this journey (steps 4 and 5) can be addressed through Security Service Edge (SSE) capabilities alone, without redesigning branch networking or WAN connectivity. For many smaller organizations, that's the more realistic scope than "SASE" as a whole.

## Where this framework was written for a different scale

Cloudflare's own customer case studies illustrate the framework with examples like Indeed (deprecating an enterprise VPN across a global workforce in about three months, per Cloudflare's published account), Werner Enterprises (Cloudflare reports a reduction in malicious inbox email of more than 50% and several hours a day recovered from manual email triage), and THG (migrating 7,000+ hybrid workers off a competing SSE platform, with initial filtering policies migrated in about a week, per Cloudflare). Later phases talk about eliminating MPLS circuits between branch offices and onboarding traffic from AWS, GCP, and Azure simultaneously.

None of that is invalid — it's just describing organizations with multiple offices, dedicated network teams, and infrastructure most of our clients don't have and don't need. If you're a 15-person office or a single-location business in Cache Valley, phases involving multi-cloud orchestration and private circuit elimination aren't a maturity gap you're behind on. They're steps built for a different kind of organization entirely.

The useful part of this framework for a smaller business isn't "complete all 10 steps." It's the order: it tells you which problem to solve first, second, and third, and roughly when a given fix stops being worth the complexity it adds.

## What actually maps to a small or mid-sized business

**Phase 1 is where the strongest early candidates are, but it's not a one-size checklist.** Clientless ZTNA is often an excellent first move for contractors, third parties, and browser-accessible internal applications — it can reduce the need to install a VPN client on unmanaged devices. But for RDP, SSH, private-IP applications, databases, thick clients, or specialized protocols, the right access pattern may need a client, a private-network connector, segmentation, or a separate administrative-access design instead. MFA and identity-based policy should be foundational priorities, but implementation quality matters more than a yes/no checkbox: coverage on privileged accounts, enforcement consistency, recovery processes, conditional access, and phishing-resistant methods where feasible. Full VPN retirement is an outcome to validate application by application, not a prerequisite for improving remote access — which is the entire subject of [our phased VPN migration walkthrough](/insights/cloudflare-zero-trust-vpn-migration).

**Phase 2 applies selectively.** Web and email threat filtering is broadly relevant — most of our clients already have some version of this through Microsoft 365 or Google Workspace, and the question is usually whether it needs augmenting, not whether to start from zero. Data-loss prevention across SaaS and AI tools is real and growing in relevance as staff start pasting company data into ChatGPT, but it's not the first thing worth spending budget on if Phase 1 isn't done yet. Consolidating access, threat, and data controls onto one platform is a genuine efficiency play for organizations already running several point products — for a smaller shop that never had five separate security vendors to begin with, there's less to consolidate.

**Phase 3 is conditional, not a size cutoff.** MPLS retirement and multi-cloud orchestration are genuinely rare needs below a certain scale — most small and mid-sized organizations we work with have one or two physical sites and a single cloud provider, if any. But two pieces of Phase 3 can matter regardless of size: simplifying branch connectivity is relevant to a two-location business running aging site-to-site VPN appliances just as much as an enterprise with dozens of branches, and removing IP-based implicit trust (a finance server reachable simply because a device is on the office LAN) is a real gap at any size. The decision should follow what your environment actually looks like, not your headcount.

## The pattern that does carry over regardless of size

Two things in this framework hold at any scale, and they're the actual takeaway worth keeping:

**Sequence risk-reduction ahead of convenience.** Every phase in Cloudflare's framework front-loads the highest-risk, highest-value problem (risky-user access, then threat filtering, then network exposure) before the lower-urgency ones. That's a reasonable default for a five-person IT shop deciding what to fix first, not just a 10,000-employee enterprise deciding what to fix next.

**Consolidation has a real ceiling on value.** The framework's own logic (steps 6 and 10) is that piling on point products eventually costs more in management overhead than it protects. That's true whether you're consolidating five platforms into one or deciding not to buy a sixth tool your five-person team can't realistically manage. Recognizing that ceiling early is worth more than chasing every step on the list.

## Where this leaves you

If you're wondering whether you're "behind" on SASE, don't measure yourself against a ten-step enterprise roadmap. Start with the specific access, identity, phishing, data-handling, or network-management problem that's creating the most risk or operational friction today.

For many small and mid-sized organizations, the practical destination is stronger identity controls, least-privilege access to private applications, better web and email protection, and a manageable set of security tools — not a full multi-cloud, MPLS-free network transformation. AllTech is a Cloudflare partner and helps organizations across Northern Utah identify that next practical step, including which enterprise-scale milestones are actually relevant and which can wait.

---

**Source note:** The framework, statistics, and case-study summaries referenced in this article are drawn from Cloudflare's ebook, [*Achieving SASE Success: 10 Key Milestones to Get It Right*](https://www.cloudflare.com/lp/achieving-sase-success/), including research commissioned from Enterprise Strategy Group (ESG) and a Forrester Consulting cost-benefit study cited within that publication, and Cloudflare's own published customer case studies. AllTech has independently adapted and commented on this material for smaller organizations evaluating their own security posture.

**Disclosure:** AllTech is a Cloudflare partner. Our recommendations are based on each client's applications, identity environment, security requirements, and operational constraints — not on any one vendor's material.

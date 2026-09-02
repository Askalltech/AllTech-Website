---
title: "The Business Case for Replacing Your VPN (Before Something Forces the Issue)"
description: "New research shows most organizations are already moving off VPNs for Zero Trust access. The data on why, and what it takes to get buy-in."
pubDate: 2026-08-27
author: "AllTech"
heroImage: "/insights/vpn-replacement-business-case.webp"
heroImageCredit:
  name: "Conny Schneider"
  url: "https://unsplash.com/photos/xuTJZ7uD7PI"
tags: ["cloudflare", "zero trust", "vpn", "cybersecurity"]
---

Most conversations about replacing a VPN start with a technical question: which product, which protocol, which vendor. That's the wrong place to start, and it's part of why so many organizations that know they should move off VPNs haven't.

A February 2025 Cloudflare whitepaper, [*The Path to VPN Replacement*](https://www.cloudflare.com/lp/path-to-vpn-replacement/), pulls together research from Enterprise Strategy Group (ESG) and a set of Cloudflare's own enterprise customers that puts real numbers behind a trend we've been seeing directly with clients: VPN replacement is no longer an edge-case project. Many organizations still haven't started, not because the idea is fringe, but because application inventory, legacy protocols, and unclear ownership make the work harder than picking a product.

## The numbers

A few stats from the ESG research Cloudflare commissioned stand out:

- **In Cloudflare-commissioned ESG research, 74% of surveyed organizations said they had replaced their VPN with Zero Trust Network Access (ZTNA) or planned to.** That bundles completed migrations with future intent, but it's still evidence that application-level access has become a mainstream direction, even for organizations still early in the journey.
- **98% of IT security decision-makers agree** that connecting users directly to the applications they need — instead of the broader network — matters.
- **84% of IT decision-makers said agentless deployment** (no client software required on the device) significantly accelerated their Zero Trust rollout.

None of that is AllTech's data — it's Cloudflare's, drawn from their own commissioned research and published customer stories. We're citing it because it matches what we see when we scope these projects for clients in Cache Valley and along the Wasatch Front: in most engagements, the hardest work isn't selecting a platform — it's identifying applications, owners, dependencies, and an acceptable migration sequence.

## What VPN complacency actually costs

The instinct to leave a working VPN alone is understandable — it's not broken, so why touch it. But "not broken" and "not costing you anything" aren't the same thing. A few data points worth sitting with, again as cited in Cloudflare's whitepaper:

**Breach and compliance exposure.** Cloudflare's whitepaper cites Corvus Insurance data reporting that VPN-based initial access accounted for nearly 30% of ransomware incidents in Q3 2024. It also points to enforcement actions and breach-related penalties — from the U.S. Department of Health and Human Services, the SEC, the New York State Attorney General, and the Australian government — in which compromised remote-access infrastructure or VPN exposure was part of the broader incident context. The lesson isn't that every VPN creates a compliance failure; it's that broad, persistent network access raises the consequences once an account or edge service is compromised.

**Operational drag.** A fintech company profiled in the whitepaper found that after moving to ZTNA, its DevOps team recovered almost 90% of the time it had been spending preparing application deployments — time that had been going into VPN-related friction instead. A global ed-tech company cut new-employee onboarding time by 60% the same way.

**Bandwidth costs that are hard to see coming.** The whitepaper also cites a Forrester Consulting survey in which 72% of respondents said they exceeded their cloud budget in the prior fiscal year, with 42% identifying bandwidth overconsumption as a key contributor. VPNs make it genuinely difficult to see where that bandwidth is going until the bill arrives.

None of these costs show up on a network diagram. They show up in a security incident report, a resignation, or a budget review — which is exactly why they're easy to defer until one of those things happens to you.

## It's not just enterprise-scale companies

The case studies in Cloudflare's whitepaper come from large organizations — Indeed, Delivery Hero, EQT — and it would be fair to wonder whether any of this applies below that scale. Two things are worth separating here.

The scale of the *deployment* is enterprise. The *reasons* for it are not.

Indeed's senior manager of information security, Matthew Ortiz, described their legacy VPN's problem in a way that's just as true for a 40-person company as a 13,000-employee one: their VPN "could be slow or add friction in ways that annoyed users and made them turn off the connection, which created blind spots for us." A VPN that people route around isn't providing the security it's there for — that failure mode doesn't require enterprise scale, just enough friction and enough time.

Delivery Hero's Wilson Tang, describing their move away from VPN-managed access as the company scaled from roughly 9,000 to 30,000 employees, put it plainly: "With so many different new people and infrastructures to manage, the complexity added up. That limited how efficiently we could innovate." A smaller organization feels the same complexity tax proportionally — it just arrives sooner, because there's less slack in the system to absorb it.

## Getting buy-in without an enterprise change-management department

The whitepaper's advice on internal alignment is written for organizations with separate security-architecture and connectivity-architecture teams. Most of our clients don't have that org chart — IT is one team, sometimes one person. The underlying logic still holds, just compressed:

- **Security's stake:** less standing network exposure, fewer credentials that grant more access than a role actually needs, and an access model that's easier to explain in an audit than "everyone on the VPN can reach everything."
- **Operations' stake:** fewer support tickets from VPN client issues, faster onboarding and offboarding, and access that follows the person instead of a device profile someone has to remember to revoke.
- **Leadership's stake:** the actual dollar cost of the status quo — bandwidth overage, support hours, and the potential incident-response costs, business interruption, and insurance implications of compromised remote-access credentials.

If you're the one person who has to make this case internally, that's the framing that tends to land: not "Zero Trust" as a buzzword, but the specific, current cost of not doing it.

## Where to actually start

Cloudflare's whitepaper describes a three-phase model — initial rollout, expansion, advancement — that lines up closely with how we approach it for clients: shadow the VPN with a pilot group first, cut over in documented waves, then retire legacy VPN access only after validation, monitoring, and an agreed rollback window, with any remaining exceptions tracked rather than ignored. We've written up [how that migration actually goes, stage by stage, including what didn't migrate on the first pass](/insights/cloudflare-zero-trust-vpn-migration).

The order matters more than the timeline. Organizations that try to eliminate VPN access everywhere at once tend to stall out on the applications nobody remembers the reason for. Organizations that start with the handful of apps causing the most friction today build momentum — and internal confidence — for tackling the rest.

ZTNA doesn't mean every remote-access workflow becomes a browser tab overnight. Web applications and many administrative portals can often be delivered agentlessly — no client software required. SSH, RDP, database access, and other private-IP or arbitrary TCP/UDP workloads typically need a device client, private-network routing, or posture checks instead. Site-to-site connectivity and certain non-human workloads may stay outside the initial scope entirely. A good migration reduces unnecessary VPN dependence first, then addresses the remaining exceptions deliberately — it isn't a one-for-one swap.

## Where this leaves you

If you're still relying on a VPN because it works, the first question isn't whether to rip it out. It's which users, applications, and workflows would be safer and easier to support with application-level access instead — and which ones should stay on the VPN for now, as a documented decision rather than an oversight.

AllTech is a Cloudflare partner and helps organizations across Northern Utah evaluate and phase secure-access migrations — from application discovery and identity integration through pilot deployments, exception handling, and measured VPN retirement. If you want a practical inventory of what can move first and what should remain an exception for now, that's a conversation worth having before something forces it.

---

**Source note:** Statistics and customer examples in this article are drawn from Cloudflare's February 2025 whitepaper, [*The Path to VPN Replacement*](https://www.cloudflare.com/lp/path-to-vpn-replacement/), including research commissioned from Enterprise Strategy Group (ESG) and third-party sources cited within that publication. AllTech has independently adapted and commented on these findings for organizations evaluating secure remote access.

**Disclosure:** AllTech is a Cloudflare partner. Our recommendations are based on each client's applications, identity environment, security requirements, and operational constraints — not on any one vendor's material.

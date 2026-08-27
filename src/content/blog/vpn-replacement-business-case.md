---
title: "The Business Case for Replacing Your VPN (Before Something Forces the Issue)"
description: "New research shows most organizations are already moving off VPNs for Zero Trust access. Here's the data on why, what it costs to wait, and what it actually takes to get buy-in."
pubDate: 2026-08-27
author: "AllTech"
heroImage: "/insights/vpn-replacement-business-case.webp"
heroImageCredit:
  name: "Conny Schneider"
  url: "https://unsplash.com/photos/xuTJZ7uD7PI"
tags: ["cloudflare", "zero trust", "vpn", "cybersecurity"]
---

Most conversations about replacing a VPN start with a technical question: which product, which protocol, which vendor. That's the wrong place to start, and it's part of why so many organizations that know they should move off VPNs haven't.

A February 2025 Cloudflare whitepaper, *The Path to VPN Replacement*, pulls together research from Enterprise Strategy Group (ESG) and a set of Cloudflare's own enterprise customers that puts real numbers behind a trend we've been seeing directly with clients: VPN replacement isn't a fringe idea anymore. It's the default plan for most organizations — the holdouts are the ones still explaining why they haven't started.

## The numbers

A few stats from the ESG research Cloudflare commissioned stand out:

- **74% of organizations have already replaced their VPN with Zero Trust Network Access (ZTNA), or plan to.** This is past the early-adopter phase.
- **98% of IT security decision-makers agree** that connecting users directly to the applications they need — instead of the broader network — matters.
- **84% of IT decision-makers said agentless deployment** (no client software required on the device) significantly accelerated their Zero Trust rollout.

None of that is AllTech's data — it's Cloudflare's, drawn from their own commissioned research and published customer stories. We're citing it because it matches what we see when we scope these projects for clients in Cache Valley and along the Wasatch Front: the technology question is usually settled well before the organizational one is.

## What VPN complacency actually costs

The instinct to leave a working VPN alone is understandable — it's not broken, so why touch it. But "not broken" and "not costing you anything" aren't the same thing. A few data points worth sitting with, again as cited in Cloudflare's whitepaper:

**Breach and compliance exposure.** According to Corvus Insurance data cited in the report, VPN-based initial access accounted for nearly 30% of ransomware incidents in Q3 2024 alone. Regulators have taken notice — the whitepaper notes multimillion-dollar compliance fines tied to VPN-related breaches from the U.S. Department of Health and Human Services, the SEC, the New York State Attorney General, and the Australian government.

**Operational drag.** A fintech company profiled in the whitepaper found that after moving to ZTNA, its DevOps team recovered almost 90% of the time it had been spending preparing application deployments — time that had been going into VPN-related friction instead. A global ed-tech company cut new-employee onboarding time by 60% the same way. Slow onboarding isn't just an inconvenience: nearly three in ten employees who are dissatisfied with onboarding say they plan to look for a new job within three months.

**Bandwidth costs that are hard to see coming.** A Forrester Consulting survey found 72% of companies exceeded their cloud budget last fiscal year, and 42% pointed to bandwidth overconsumption as a key driver. VPNs make it genuinely difficult to see where that bandwidth is going until the bill arrives.

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
- **Leadership's stake:** the actual dollar cost of the status quo — bandwidth overage, support hours, the deductible on a cyber policy after an incident traced back to compromised VPN credentials.

If you're the one person who has to make this case internally, that's the framing that tends to land: not "Zero Trust" as a buzzword, but the specific, current cost of not doing it.

## Where to actually start

Cloudflare's whitepaper describes a three-phase model — initial rollout, expansion, advancement — that lines up closely with how we approach it for clients: shadow the VPN with a pilot group first, cut over application by application, then decommission once nothing undocumented is left depending on it. We've written up [how that migration actually goes, stage by stage, including what didn't migrate on the first pass](/insights/cloudflare-zero-trust-vpn-migration).

The order matters more than the timeline. Organizations that try to eliminate VPN access everywhere at once tend to stall out on the applications nobody remembers the reason for. Organizations that start with the handful of apps causing the most friction today build momentum — and internal confidence — for tackling the rest.

## Where this leaves you

If your organization is still running on a VPN because it works and nobody's had time to look at the alternative, you're not behind some curve that started yesterday — but the data says you're increasingly in the minority, and the costs of staying there are measurable, not hypothetical.

AllTech is a Cloudflare partner, and VPN-to-Zero-Trust migration is work we scope and run for clients across Northern Utah — from the application-discovery phase through a phased cutover that doesn't put your team's daily work at risk. If you're trying to figure out where your organization actually stands on this, that's a conversation worth having before something forces it.

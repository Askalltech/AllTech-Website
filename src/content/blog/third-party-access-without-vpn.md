---
title: "Giving Contractors Access Without Handing Them a VPN Client"
description: "Contractors and temporary staff on personal devices are a real access problem. A browser-based alternative to VPN clients — and where it does and doesn't fit."
pubDate: 2026-08-27
author: "AllTech"
heroImage: "/insights/third-party-access-without-vpn.webp"
heroImageCredit:
  name: "Hassaan Here"
  url: "https://unsplash.com/photos/a-computer-screen-with-a-blue-and-black-design-on-it-B7DZ1pmvUMw"
tags: ["cloudflare", "zero trust", "remote access", "cybersecurity"]
---

Most small businesses eventually face a version of the same problem: someone who is not an employee needs temporary access to something internal. A bookkeeper who works for three other clients. A contract developer on their own laptop. A vendor's technician who needs to touch one system for one afternoon. None of them are getting a company-issued device, and they often should not receive broad VPN access.

The usual fallback — a VPN account on a personal device or a company laptop issued for a short engagement — can create access-management debt when ownership, expiry dates, device controls, and offboarding aren't handled consistently. The problem isn't that VPN access or loaner laptops exist; it's whether they're correctly scoped, monitored, and revoked. A Cloudflare solution brief on third-party access describes a browser-based alternative worth knowing about, and where it fits.

## Why the usual options are worse than they look

Giving a contractor VPN credentials for a personal laptop can create a managed-access problem: the device may sit outside your patching, EDR, encryption, and compliance controls, while the VPN may provide a network-layer path broader than the person's actual task requires. A ZTNA client can improve on that with more granular, least-privilege access — but it can still be impractical for an unmanaged or temporary device when the contractor won't install company-required software, or your team can't reasonably support yet another client. Cloudflare's own brief is careful on this point: it says device clients "may not be a good fit" for third-party or temporary users, not that they fail outright.

The alternative Cloudflare describes is clientless access: authentication and authorization happening through the browser, with no software installed on the end user's device at all. For a specific slice of the access problem — third parties, unmanaged devices, short-term engagements — that's a meaningfully different tradeoff than either a VPN or a full device-client rollout.

## What it actually covers

Per Cloudflare's brief, browser-based clientless access is built for two categories:

- **Web applications** — self-hosted internal apps reachable on their own hostname, made to feel like navigating to a website rather than connecting to a network.
- **Infrastructure access over SSH, RDP, or VNC** — proxied through the browser rather than a native client, so a contractor can reach a specific server without a network-level tunnel to everything else.

The access model layers identity and data controls on top: multiple single sign-on options (including social identity providers or one-time PINs, useful for people who aren't in your primary directory), and granular per-resource authorization instead of network-level access. Where Cloudflare Browser Isolation and the relevant policies are deployed, session controls can also restrict actions like copy/paste, uploads, downloads, or keyboard input for sensitive workflows — configuration- and licensing-dependent controls, not something every basic clientless deployment includes automatically, and a risk reducer rather than a guarantee against exfiltration by other means (a screenshot, a phone camera, manual transcription).

## Where this doesn't apply

This is the part worth being direct about, because a solution brief's job is to sell the fit case, not the edge cases. Browser-based clientless access is a strong match for a defined, narrow list of things — a specific internal web app, a specific server a vendor needs to touch. It's a weaker or poor fit for:

- Legacy or thick-client applications that can't be delivered through a browser-accessible application or an approved browser-based protocol gateway.
- Long-running, graphics-heavy, bandwidth-intensive, or latency-sensitive workflows — browser-mediated access should be tested against the user's actual workload before it becomes the standard access method, not assumed to perform like a native client.
- Workflows that require local-device integration — USB peripherals, smart-card readers, printers, specialized scanners, local file mounts, or proprietary hardware — which typically need a managed endpoint or another access pattern. For a small business, this is often the practical reason browser-only access can't be the whole answer.
- Anything requiring genuinely broad, sustained network access, where a properly scoped device client is the more honest tool for the job, not a workaround to avoid installing one.

The judgment call is matching the access pattern to how someone actually needs to work, not defaulting to clientless because it's the easiest to deploy.

## A real example, with the caveat it deserves

Cloudflare's brief cites Canva, the graphic design platform, as a customer example: as Canva scaled quickly and increased its use of third-party developers, Cloudflare's brief says Canva turned to Cloudflare to improve the security and efficiency of user authentication and application-usage tracking. Jim Tyrrell, Canva's Head of Infrastructure, is quoted: "Cloudflare Access saved us from having to develop our own Identity and Access Management (IAM) system."

That's Cloudflare's own published customer account, not something AllTech verified independently, and Canva's engineering scale isn't the scale most of our clients operate at. The relevant takeaway isn't the specific number of developers Canva onboarded — it's the shape of the problem: fast-growing third-party access needs, solved without building custom identity infrastructure from scratch. That shape shows up just as often at much smaller scale.

## Where this fits for a smaller business

For a lot of our clients, this isn't a replatforming project — it's a fix for one specific, recurring headache: the seasonal bookkeeper, the outside developer, the vendor technician who needs one afternoon of access twice a year. Clientless access is often the first practical Zero Trust use case worth standing up, before a broader VPN replacement or Zero Trust rollout, precisely because it's scoped, low-risk to pilot, and doesn't require touching anyone's existing internal access.

If you're currently solving this with a shared VPN login, a spreadsheet of who has what credentials, or a laptop that gets mailed out and never quite comes back, that's worth a second look — not because the current approach is dramatic-failure-waiting-to-happen, but because it's the kind of quiet access sprawl that's expensive to untangle once it's had a few years to accumulate.

AllTech helps organizations across Northern Utah assess third-party access by identifying the exact applications external users need, the identity and device constraints involved, the controls required for each workflow, and whether browser-based access, managed-device access, or another design is the right fit. AllTech is a Cloudflare partner.

---

**Source note:** The product description, use cases, and the Canva customer example in this article are drawn from Cloudflare's solution brief, *Secure Third-Party Access* (Q1 2025). AllTech has independently adapted and commented on this material for organizations evaluating contractor and third-party access.

**Disclosure:** AllTech is a Cloudflare partner. Our recommendations are based on each client's applications, identity environment, security requirements, and operational constraints — not on any one vendor's material.

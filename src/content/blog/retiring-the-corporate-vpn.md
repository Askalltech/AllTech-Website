---
title: "Retiring the corporate VPN: a phased rollout to Cloudflare Zero Trust"
description: "Why most VPN sunsets fail mid-migration, and how we structure a rollout that doesn't break things."
pubDate: 2026-02-10
author: "AllTech"
heroImage: "/insights/retiring-the-corporate-vpn.webp"
heroImageCredit:
  name: "Shubham Dhage"
  url: "https://unsplash.com/photos/a-brain-displayed-with-glowing-blue-lines-2sz-3NrmZYU"
tags: ["cloudflare", "zero trust", "vpn", "migration"]
---

When a business decides to retire its legacy VPN, the failure mode isn't usually technical — it's organizational. People still need to get to file servers, RDP into production hosts, and connect from coffee shops while the rollout is in flight. Here's how we think about pacing a Zero Trust migration so the business keeps running.

## Stage 1: shadow the VPN

Deploy WARP alongside the existing VPN, not in place of it. Users can connect via either path. We watch traffic, identify the apps that actually matter, and write the first set of Access policies against real usage data instead of guesses.

## Stage 2: cut over by application

Once we know what's actually being used, we publish those apps through Cloudflare Tunnel and route users through Access. The VPN stays available but its DNS scope shrinks. If something breaks, the fallback is one click away.

## Stage 3: collapse the VPN

When traffic on the VPN drops to noise — typically 4–8 weeks in — we schedule the decommission. The firewall rules opening 1194/UDP get removed. The concentrator gets retired.

The result is the same security posture every analyst report has been telling you to chase, but achieved without a flag-day cutover that wakes everyone up at 6 AM.

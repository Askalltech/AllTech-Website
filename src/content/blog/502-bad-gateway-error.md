---
title: "502 Bad Gateway Error: Causes and How to Fix It"
description: "A 502 bad gateway error means a server in your request chain got an invalid response from another server. Here's what causes it and how to fix it."
pubDate: 2026-08-14
author: "AllTech"
heroImage: "/insights/502-bad-gateway-error.webp"
heroImageCredit:
  name: "Dale Choi"
  url: "https://unsplash.com/photos/white-and-black-concrete-building-under-white-sky-during-daytime-dAttgwmZaKM"
tags: ["IT Support", "troubleshooting", "web hosting", "networking", "managed IT"]
draft: false
---

## What a 502 Error Means

A 502 bad gateway error means a server acting as a gateway or proxy received an invalid response from an upstream server. For a website, that usually means the proxy or CDN couldn't get a usable response from the web server, application, or service behind it.

In most cases, this points to a server-side problem — not something wrong with the visitor's browser or device. Usually the issue sits at the origin server or the application behind it, though occasionally the proxy or CDN path itself is involved.

## Common Causes

**Origin server is down or unreachable.** The web server hosting your site crashed, restarted, or isn't accepting connections on the expected port.

**Origin server is overloaded.** Too many simultaneous requests, a traffic spike, or a resource-heavy process can cause the server to stop responding in time.

**Incorrect origin address or network path.** The proxy may be trying to reach an old IP address, the wrong server, or a service no longer listening on the expected port.

**Firewall blocking the connection.** A firewall rule on the origin server or network can silently drop the gateway's requests.

**Faulty compression at the origin.** If the origin serves gzip-compressed content with a mismatched `content-length` header, or sends broken compressed data, the gateway will reject the response.

**Application or timeout errors.** A backend application, database, or service the web server depends on times out or crashes mid-request.

## If You're Using Cloudflare

Cloudflare shows two different versions of this error, and knowing which one you're looking at determines where to troubleshoot.

**Cloudflare-branded 502 page:** Your origin server returned the 502 itself. This is the most common case. The fix starts with your hosting provider or server admin — check server load, crash logs, and whether the application responded to the request in time.

**Unbranded, blank 502 page:** Cloudflare's edge generated the error, not your origin. This can point to a compression mismatch at the origin, or in rarer cases a temporary shift in Cloudflare's traffic routing during a data center adjustment, which typically resolves in seconds.

If you're running Cloudflare Tunnel and see a 502 with the message "Unable to reach the origin service," the tunnel is connected to Cloudflare's network fine — `cloudflared` just can't reach the service defined in your ingress configuration. Check that the local service is running and listening on the port your tunnel config points to.

## How to Troubleshoot a 502 Error

1. **Confirm the scope.** Test the affected page from another network or device. If it fails consistently from multiple locations, investigate the site, origin server, DNS, and proxy path — not just one visitor's connection.
2. **Capture the details.** Record the exact URL, the time and timezone, and any Cloudflare Ray ID shown on the error page.
3. **Check server status.** Log into your hosting dashboard or server directly and confirm the web service is running.
4. **Review recent changes.** Deployments, plugin updates, certificate changes, and firewall or DNS changes are common triggers — check what changed right before the error started.
5. **Check resource usage.** High CPU, memory, or connection counts on the origin server can cause it to stop responding.
6. **Inspect firewall and security rules.** Confirm nothing is blocking traffic between the gateway/proxy and the origin.
7. **Verify DNS records.** Make sure the domain resolves to the correct, current origin IP.
8. **Review logs.** Server, application, database, and CDN/proxy logs will usually show a timeout, connection refusal, or crash near the timestamp of the error.

If Cloudflare is involved, gather the evidence before it disappears: the failing URL, timestamp with timezone, Ray ID, and the output from visiting `yourdomain.com/cdn-cgi/trace`. That combination is what Cloudflare Support asks for and it's what pinpoints whether the failure started at your origin or at Cloudflare's edge.

## When to Call In Help

A one-time 502 that clears quickly may just be transient — but note the time and affected URL anyway. Investigate promptly if it repeats, affects multiple users or pages, coincides with a deployment, or happens during business-critical hours. Every minute your site or app is down is a minute customers can't reach you.

If your team doesn't have someone watching server health and logs full-time, that's where managed IT and remote monitoring pay for themselves: catching resource spikes, failed deployments, and origin outages before they turn into a 502 a customer reports to you first.

AllTech provides managed IT and network infrastructure support for businesses across Cache Valley, the Wasatch Front, and southern Idaho. If your business is dealing with recurring 502 errors or unreliable uptime, [contact us](/contact) or call (435) 557-3232.

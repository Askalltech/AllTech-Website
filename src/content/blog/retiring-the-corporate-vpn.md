---
slug: "cloudflare-zero-trust-vpn-migration"
title: "Retiring the Corporate VPN: A Phased Cloudflare Zero Trust Rollout"
description: "How AllTech phases corporate VPN retirement with Cloudflare Zero Trust — from application discovery and Access/Tunnel rollout to safe decommissioning."
pubDate: 2026-02-10
updatedDate: 2026-08-25
author: "AllTech"
heroImage: "/insights/retiring-the-corporate-vpn.webp"
heroImageCredit:
  name: "Shubham Dhage"
  url: "https://unsplash.com/photos/a-brain-displayed-with-glowing-blue-lines-2sz-3NrmZYU"
tags: ["cloudflare", "zero trust", "vpn", "migration"]
---

> Details have been generalized to protect client confidentiality. The migration framework described below reflects a real-world approach, but application requirements, rollout timelines, and security controls vary between environments.

The objective was not simply to turn off a VPN. It was to replace broad, network-level remote access with a more deliberate access model that was easier to review, support, and revoke.

Achieving that safely required application discovery, user validation, rollback planning, and a phased rollout that allowed the existing VPN and Cloudflare Zero Trust environment to operate in parallel until adoption and testing were complete.

Like many organizations, our client relied on a traditional VPN to provide remote access to internal resources. Over time, the VPN became the default solution for every remote-access requirement. Users received broad network access because they needed a single application. Legacy routes remained in place because no one wanted to risk disrupting an established workflow. New systems were added faster than old access paths were retired.

Rather than attempting a single, high-risk cutover weekend, we approached the migration as a three-stage project:

1. Shadow the VPN
2. Cut over by application
3. Decommission or repurpose the VPN infrastructure after a validated rollback period

The goal was not to eliminate every VPN use case at any cost. The goal was to replace broad network-level access with identity-based, least-privilege access wherever practical.

## The environment and constraints

The environment included a mix of remote and hybrid workers who required access to several categories of internal resources:

- Internal web applications
- Administrative systems
- Remote administration workflows
- File shares
- Line-of-business applications
- Identity-provider integrated services

Multi-factor authentication was already required for remote access, and user identities were managed through a centralized directory service.

From a technology perspective, deploying Cloudflare Access, Cloudflare Tunnel, and the Cloudflare One Client (formerly WARP) was relatively straightforward.

Cloudflare Tunnel provided outbound connectivity to approved private resources without exposing those resources directly to the public internet. Cloudflare Access applied identity-based policies and authentication requirements before users could reach those resources. Treating connectivity and authorization as separate functions helped simplify application-by-application migration decisions.

The larger challenge was understanding exactly how people used the existing VPN.

Several VPN routes had existed for years. Documentation was incomplete. Not every application had a clearly identified owner. In some cases, usage patterns were obvious. In others, systems appeared inactive until business stakeholders identified monthly or quarterly processes that depended on them.

This became the primary lesson of the project: **replacing a VPN is often more of an application-discovery exercise than a networking exercise.**

## Why VPN replacement is not a switch flip

Traditional VPNs provide network-level access. Users authenticate and are often granted access to large portions of an organization's internal network, whether they require those resources or not.

In this migration, Zero Trust Network Access (ZTNA) shifted access decisions from broad network routes toward specific applications and private resources.

Instead of providing access to an entire network segment, access was granted to specific applications or resources based on identity, security policy, and business requirements.

The technology itself was rarely the most difficult part of the migration. The complexity came from questions such as:

- Who actually uses this application?
- What workflow depends on it?
- What happens if access fails?
- Who validates success?
- What is the rollback plan?

Answering those questions before migrating an application dramatically reduced the risk of unexpected outages.

## Stage 1: shadow the VPN

The first stage was intentionally conservative.

We did not immediately remove existing VPN access. Instead, we deployed the Cloudflare One Client to a limited pilot group and allowed the new access path to operate alongside the existing VPN.

**Objectives**

- Identify pilot users and their critical workflows
- Document destination systems, protocols, identity sources, and resource owners
- Validate DNS, authentication, and device-policy behavior
- Establish rollback procedures
- Record baseline support and access issues before changing the default path

**Success criteria**

The pilot phase was considered successful when:

- Users authenticated successfully
- Core workflows completed normally
- MFA policies behaved as expected
- Support documentation was available
- Rollback procedures were validated

**What we learned**

The pilot uncovered several dependencies that were not obvious from VPN traffic alone.

Certain workflows occurred infrequently enough that they did not appear during normal observation periods. Some applications had clear owners and validation processes. Others required additional investigation before migration decisions could be made.

Instead of forcing those applications into the next phase, they remained under observation. That decision prevented migration risk from becoming business disruption.

**Maintaining parallel access during the pilot**

During the shadow phase, both access paths remained available:

```
                    ┌──────────────────────────────┐
Remote user ───────►│ Corporate VPN                │────► Internal resources
     │              │ Retained during pilot        │
     │              └──────────────────────────────┘
     │
     └─────────────► Cloudflare One Client / browser
                     │
                     ▼
              Identity provider + MFA
                     │
                     ▼
             Cloudflare Access policy
                     │
                     ▼
        Cloudflare Tunnel (outbound connection)
                     │
                     ▼
          Approved private application
```

This parallel approach reduced pressure on users and IT staff because adoption did not depend on a single migration event.

If a workflow failed validation, the legacy VPN remained available while the issue was investigated.

## Stage 2: cut over by application

After confidence was established in the pilot group, applications were migrated individually rather than moving entire user populations at once.

This stage focused on understanding how each application should be accessed and validated.

Applications that were good candidates for early migration included:

- Internal web applications
- Administrative portals
- Support tools
- Identity-integrated services

Other workloads required additional planning, including:

- File shares
- Legacy applications
- Specialized protocols
- Department-specific business systems

Rather than categorizing everything as a VPN replacement project, each workload received its own evaluation.

**Success criteria**

Applications progressed when:

- The business owner confirmed expected behavior
- Authentication worked correctly
- Access logging was validated
- Support procedures existed
- Rollback plans were documented

The objective was not speed. The objective was confidence.

**Migration decision framework**

Every workload required an owner, validation process, and documented migration decision.

| Workload type | Current access | Identity model | Future access method | Validation owner | Status |
| --- | --- | --- | --- | --- | --- |
| Internal web application | VPN | Directory group | Cloudflare Access + Tunnel | Application owner | Migrated |
| Administrative system | VPN + administrative access | MFA group | Private-network access through Cloudflare One Client and Tunnel | IT team | Migrated |
| File share | VPN | Security group | Under evaluation | Department owner | Exception |
| Legacy application | VPN | Legacy authentication | Pending redesign | Business owner | Deferred |

The table itself was less important than the discipline it enforced. Each workload required a documented owner, validation criteria, rollback path, and migration decision before progressing to the next stage.

## Stage 3: decommission or repurpose the VPN environment

By the final phase, most routine workflows had already transitioned to the new access model.

The remaining work focused on validating that no undocumented dependencies remained.

**Retirement criteria**

Before retiring the VPN environment, we confirmed:

- No unapproved dependency remained
- Exceptions were documented
- Application owners had completed validation
- Access policies functioned as expected
- Monitoring and logging were operational

**Cleanup activities**

The final phase included:

- Removing unnecessary VPN accounts
- Reviewing firewall rules
- Updating documentation
- Validating monitoring coverage
- Closing rollback records

Only after the agreed rollback period expired did we consider the VPN infrastructure ready for decommissioning or repurposing.

## What didn't migrate yet

Not every workload was migrated immediately. A handful of systems remained on alternative access methods for legitimate business reasons.

Examples included:

- Applications lacking a clearly identified validator
- Legacy software requiring redesign
- Workflows dependent on specialized protocols
- Business processes requiring additional testing

These were not migration failures. They were documented risk-management decisions.

Each exception had an owner, reason, compensating controls where appropriate, and a scheduled review date.

One of the most important lessons from the project was recognizing the difference between a temporary exception and a permanent obstacle. Documented exceptions allowed progress without introducing unnecessary risk.

## Lessons learned

**Identity cleanup took longer than expected.** Application migration was often easier than permission cleanup. Legacy groups, outdated memberships, and historical exceptions accumulated over time and required review before access policies could be simplified.

**Unknown dependencies matter more than technology.** Cloudflare Access and Cloudflare Tunnel solved connectivity and policy challenges. The harder problem was identifying dependencies that were poorly documented or rarely used.

**Rollback confidence accelerates adoption.** Users were far more comfortable testing new access methods when they knew the existing VPN remained available during validation. That confidence reduced support pressure and improved feedback quality.

## Operational outcomes

Every environment is different, and results vary between organizations. In this case, several operational improvements became apparent as application migrations were completed:

- Access decisions became more consistently tied to named resources and identity groups.
- Application owners had a clearer role in validating access changes.
- Offboarding processes relied more heavily on centrally managed identity controls rather than broadly provisioned VPN access.
- Access reviews shifted from maintaining network routes to validating application-specific permissions and business roles.
- Administrative visibility improved because access decisions could be evaluated at the resource level rather than the network level.

Most importantly, remote-access discussions became application-focused rather than network-focused.

## When a VPN still makes sense

A mature Zero Trust strategy does not require eliminating every VPN deployment. Certain scenarios may continue to justify VPN-based access, including:

- Site-to-site connectivity requirements
- Specialized legacy systems
- Hardware-dependent workflows
- Transitional architectures
- Temporary business exceptions

The objective is not to eliminate VPN technology entirely. The objective is to reduce unnecessary network-level exposure where a more targeted access model is appropriate.

## Considering a VPN-to-Zero-Trust migration?

If your organization is evaluating Cloudflare Zero Trust, VPN modernization, or identity-based remote access, the first step is usually not selecting a product.

It is identifying applications, validating dependencies, and building a migration plan that protects business operations throughout the transition.

AllTech helps organizations across Northern Utah evaluate remote-access requirements, identify migration risks, and implement phased Zero Trust rollouts that prioritize business continuity alongside security.

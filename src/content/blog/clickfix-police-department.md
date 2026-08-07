---
title: "What a ClickFix Attack Looks Like From the Inside"
description: "A small-town Utah police department almost lost control of an officer's workstation to a technique that doesn't require a working exploit — just someone trusting a fake error message."
pubDate: 2026-08-07
author: "AllTech"
tags: ["incident response", "cybersecurity", "case study", "managed soc"]
---

Here's what happened, what we saw, and why the boring stuff — logging, monitoring, having someone actually watching — is what stopped it.

## The setup: no malware required

Most people picture a cyberattack as some kind of software break-in. A hacker finds a hole, writes code that slips through it, done.

ClickFix attacks skip all of that. Instead of breaking in, they convince someone to open the door themselves.

The pattern usually looks like this: a fake CAPTCHA, a fake "your download failed, click to fix" popup, or a fake troubleshooting page tells the user to open the Windows Run dialog, paste in a command, and hit enter. The instructions look routine — the kind of thing a legitimate site might actually ask you to do. There's no attachment to scan, no obvious virus. It's just a person, doing exactly what they were told, one copy-paste at a time.

That's what happened here. An officer's account executed a command through `cmd.exe` — Windows' built-in command interpreter — that had been deliberately disguised to slide past basic detection.

## What the command was actually doing

The command itself was obfuscated using something called **caret obfuscation** — inserting the `^` character between letters (so `curl` becomes `c^u^r^l`) to break up recognizable patterns that security tools scan for. It's a simple trick, but an effective one against anything that's just pattern-matching known bad strings.

Once decoded, the command was doing three things in sequence:

1. **Downloading a file** from an external domain to the user's local AppData folder
2. **Renaming and disguising it** so it wouldn't look like what it actually was
3. **Executing it through `mshta`** — a legitimate Windows tool for running HTML applications, commonly abused because it's trusted by default and rarely blocked outright

This is a technique security teams call **"living off the land"** — instead of dropping obvious malware, the attacker uses tools that are already built into Windows and already trusted by the operating system. To a basic antivirus scanner, none of these individual steps look unusual. `cmd.exe` running. `mshta` launching. A file appearing in AppData. Each one, on its own, happens on computers constantly.

It's the *sequence* that gives it away.

## The tell: what a real detection engine actually caught

This is where visibility matters more than any single tool. The platform monitoring this device — SentinelOne, provided at no cost to Utah public-sector entities through the **Utah Department of Cybersecurity** — didn't just see one suspicious event. It correlated *all* of them, in real time, and mapped the behavior against the MITRE ATT&CK framework, the industry-standard catalog of known attacker techniques:

- **DLL hijacking** and **dynamic-link library injection** — hijacking a legitimate process to run attacker code inside it
- **Stealth execution** — renaming a system tool and chaining interpreters together to mask what was actually running
- **Persistence attempts** — registering the malicious process via a scheduled task and an autorun registry key, so it would survive a reboot
- **Privilege escalation techniques** — attempting to gain higher-level system access than the logged-in user should have

None of these on their own would necessarily trigger alarm bells. Together, in the same fifteen-minute window, on the same process tree, they told a very clear story: this wasn't a fluke. This was an attempt to gain a lasting foothold on a law enforcement system.

## What happened next

The alert fired as high severity within minutes of the initial command executing. Our team was notified and looped in directly to assist with operations and remediation — working alongside the state's cybersecurity resources, since the underlying monitoring tooling is part of Utah's statewide public-sector protection program.

The process was isolated. The persistence mechanisms were reviewed and removed. The incident was closed as resolved before the attacker gained the foothold they were building toward.

No ransomware. No data loss. No downtime for the department. Just a fifteen-minute window between "an officer clicked something" and "the threat was contained" — instead of a fifteen-day window between "an officer clicked something" and "we found out the hard way."

## Why this matters for small departments specifically

Here's the uncomfortable truth: most small-town police departments and city offices don't have the staff to watch for this. There's no in-house security analyst reviewing process trees at 2 PM on a Tuesday. There's often no IT person on-site at all.

That's not a knock on anyone — it's just the reality of running a five-person department with a five-person budget. But it means the gap between "an attack happens" and "someone notices" can be measured in days or weeks instead of minutes, in a place where the network holds evidence, records, and case files that can't afford to be down, altered, or exposed.

The tools that caught this weren't exotic. They're the same category of endpoint detection available to any organization. What made the difference was that someone — and something — was actually watching, correlating, and ready to act the moment the pattern showed itself.

That's the part that doesn't show up in a budget line item, but it's the part that actually matters when it counts.

---

*Some identifying details in this post have been withheld to protect the privacy of the department involved.*

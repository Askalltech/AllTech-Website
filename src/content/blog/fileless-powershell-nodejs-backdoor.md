---
title: "Fileless PowerShell Attack Behind Node.js"
description: "A ClickFix-style attack on a Cache Valley business skipped the disk entirely: a memory-only PowerShell payload that dropped a signed-runtime backdoor."
pubDate: 2026-08-18
author: "AllTech"
heroImage: "/insights/fileless-powershell-nodejs-backdoor.webp"
heroImageCredit:
  name: "Steve A Johnson"
  url: "https://unsplash.com/photos/a-group-of-white-boxes-with-numbers-on-them-QaM0dr1xN4M"
tags: ["incident response", "cybersecurity", "case study", "clickfix", "managed soc"]
---

*Field notes from the engineering team*

A fileless PowerShell compromise on a customer-service workstation at a Cache Valley business didn't look like much at first. A static antivirus scan rated the initial activity 100% benign. It only surfaced because a behavioral detection rule — not a signature — flagged the pattern of a PowerShell process doing something PowerShell processes aren't supposed to do.

By the time the investigation was done, the picture was more involved than one bad script: a second-stage backdoor had been dropped and configured to relaunch itself, silently, every time that user logged in.

## How it got in

The entry point matches a pattern we've written about before: **ClickFix**. A fake verification page or CAPTCHA prompts the user to open the Windows Run dialog, paste in a command, and press Enter. There's no attachment, no download prompt, nothing for a file-scanning tool to catch — just a person doing exactly what the fake prompt told them to do.

The process lineage confirmed it: `explorer.exe` spawning `powershell.exe` directly, interactively, from the user's own session — not something pushed by a management tool, not something that arrived as an email attachment. Someone ran it themselves.

## What made this one harder to catch

The command itself used **array-index string obfuscation** — building the destination domain out of a shuffled array of substrings (`@('sa','fo','vemute.in')[0,2,1] -join $y4d`) instead of writing it out as a plain string. Static tools that scan for known-bad domains or keywords have nothing to match against; the string simply doesn't exist anywhere in the command until it's assembled at runtime.

Once assembled, the payload ran entirely in memory — `irm | iex`, a download-and-execute pattern that never touches disk. No file for an antivirus scanner to inspect, because no file exists.

That first-stage script reached out to an external domain and opened three outbound HTTP connections. But the real problem was what it left behind.

## The persistence mechanism

Buried in the user's registry, under `HKCU\...\Run`, sat a GUID-named value pointing to a portable Node.js runtime — not a compiled executable, not an obviously suspicious binary, but a legitimate, signed piece of software that ships on plenty of developer machines for entirely normal reasons. Node.js was simply being used to run a hidden background script, configured to launch silently and windowlessly on every login.

This is the same "living off the land" logic behind most modern intrusions: rather than dropping something that looks like malware, use a tool that's already trusted, already signed, and already unremarkable to a scanner — then point it at code the attacker controls.

## Containment and cleanup

Once the behavioral alert surfaced the activity, the response was straightforward because the scope was already well understood:

- **Process terminated** — the Node.js backdoor process was killed via `Stop-Process`.
- **Persistence removed** — the malicious registry Run key was deleted, and the rest of the registry (`Run`, `RunOnce`, Scheduled Tasks, both `HKCU` and `HKLM`) was checked for sibling entries following the same naming pattern. None were found.
- **Malware artifacts removed** — the portable Node.js runtime and its script were deleted from the endpoint's `AppData` folder entirely.
- **Network blocked** — a firewall rule was put in place blocking outbound traffic to all three identified command-and-control IP addresses, across every port and protocol, with logging enabled so any future attempt to reach them would be caught immediately.

No evidence of data exfiltration, credential theft, or financial fraud surfaced during the investigation. The incident was contained before the backdoor did anything beyond establishing itself.

## Why this one matters

Two things made this attack notable, and neither of them is exotic:

**It beat a static scan.** The initial activity was rated 100% benign by signature- and ML-based antivirus. It was only caught by a behavioral rule watching for PowerShell doing something out of pattern — the kind of detection that requires an actual monitored endpoint platform, not just "antivirus is installed."

**It used a trusted tool as its foothold.** A signed, legitimate Node.js runtime running a hidden script is a much harder thing to flag automatically than an unsigned executable with a random name. The persistence mechanism looked, on the surface, like software that belongs on a normal Windows machine.

Neither of those facts is a reason to panic. They're a reason to have something watching that isn't just checking file hashes — because the attacks that actually work anymore are usually the ones designed specifically not to look like attacks.

If your team doesn't have a monitored endpoint platform correlating behavior in real time, this is exactly the kind of incident that goes unnoticed for weeks instead of hours.

---

*Some identifying details in this post — including the affected organization — have been withheld to protect the privacy of the business involved.*

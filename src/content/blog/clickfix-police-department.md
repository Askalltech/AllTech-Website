---
title: "What a ClickFix Attack Looks Like From the Inside"
description: "A high-severity alert at a small-town Utah police department began with something deceptively ordinary: a user ran a command. Here's how it was detected, investigated, and closed in about 15 minutes."
pubDate: 2026-08-07
author: "AllTech"
tags: ["incident response", "cybersecurity", "case study", "managed soc"]
---

*Field notes from the engineering team*

A recent high-severity alert at a small-town Utah police department began with something deceptively ordinary: a user ran a command.

There was no software vulnerability being exploited and no conventional malicious attachment. The attack depended on a person being persuaded to copy, paste, and run a command presented as though it were part of a routine verification or repair step. That technique is commonly called **ClickFix**.

In this case, the activity was detected, investigated, and closed in approximately 15 minutes. The attacker did not establish lasting persistence, deploy ransomware, remove data, or interrupt the department's operations. The short outcome is encouraging. The longer story is useful because it shows how a modern social-engineering attack can combine ordinary Windows tools into a chain that is difficult to recognize one action at a time.

## The premise: make the user run it

ClickFix attacks are built around a simple idea: rather than trying to force malware onto a computer through an exploit, convince the person at the keyboard to run the first command for the attacker.

The prompt may resemble a CAPTCHA, browser error, document warning, or "fix this problem" instruction. It asks the user to open a Windows utility, paste text, and press Enter. To the user, this can look like a harmless troubleshooting step. To an attacker, it is a way to get code running under that user's own account.

That distinction matters. Security tools and users are often trained to look for suspicious downloaded attachments or unfamiliar applications. A command run through the Windows Command Line Interpreter (`cmd.exe`) can appear less alarming on its own—especially when Windows utilities are being used as intended at a technical level, but for an illegitimate purpose.

## What the command set in motion

The command executed on this workstation did not present its intent plainly. It used **caret obfuscation**, inserting `^` characters between letters. For example, a command such as `curl` can be written as `c^u^r^l`. Windows interprets it as the original command, but simple text matching may not.

That was the first signal that this was not routine activity. The obfuscated command then downloaded a file from an external domain into the user's local AppData folder.

The downloaded file was executed through `mshta`, the Microsoft HTML Application host. `mshta` is a legitimate Windows binary, which is why it can be useful in an attack chain: it is already present on many systems and is not inherently malicious. When attackers use legitimate, trusted tools in this way, it is often described as "living off the land." The tool is real; the purpose and surrounding behavior are not.

From there, the process attempted to make itself survive a reboot. It tried to establish persistence through both a scheduled task and an autorun registry key. It also used a file whose actual name did not match its claimed or displayed name, adding another layer of disguise.

Individually, some of these actions can occur in normal administrative work. Taken together, they describe a recognizable pattern:

- A user executes a copied command in the Windows shell.
- The command is intentionally obscured.
- It retrieves a file from outside the organization.
- A trusted Windows binary launches that file.
- The process attempts to run again later through scheduled-task and registry-based persistence.
- The file identity is disguised.

That is the difference between reviewing isolated events and understanding an attack chain.

## Why the sequence mattered

The activity mapped to multiple MITRE ATT&CK techniques, including Command and Scripting Interpreter and Windows Command Shell (`T1059` and `T1059.003`), User Execution (`T1204`), and Malicious Copy and Paste (`T1204.004`). The last of those is especially relevant to the ClickFix pattern: the user's action is the initial foothold.

The alert also identified Obfuscated Files or Information (`T1027`), System Binary Proxy Execution (`T1218`), Scheduled Task/Job (`T1053`), and Registry Run Keys / Startup Folder (`T1547.001`). These are not labels added for effect. They describe the practical stages visible in the activity: concealment, execution through a trusted Windows component, and attempts to remain present after the initial command.

Additional observed behaviors included techniques associated with disguise, indirect command execution, Windows Management Instrumentation, software discovery, automated collection, DLL hijacking, DLL injection, and search-order hijacking. Not every technique needs to be understood by a nontechnical reader to understand the central concern: the process was not simply trying to run once. It was attempting to hide, learn about its environment, and remain available to the attacker.

A small department does not need to be a high-profile target for this to matter. A single workstation can be an entry point into systems that support public safety and day-to-day operations. The risk is not limited to the initial file. It is what can happen if that activity is allowed to continue unnoticed.

## Detection is more than one alert

The endpoint detection and response platform detected and flagged the activity as high severity. That platform is provided at no cost to Utah public-sector entities by the Utah Department of Cybersecurity. AllTech manages and monitors the platform with administrative rights; we do not provide, sell, or own it.

What made this event actionable was not one unusual process alone. A command shell, an AppData write, `mshta`, a scheduled task, or a registry change can each have legitimate explanations in the right context. The combined sequence—the obfuscation, external download, trusted-binary execution, disguised file, and persistence attempts—created a much clearer picture.

This is where correlation matters. Security monitoring is most useful when it can connect related events quickly enough for a person to evaluate the story they tell. In this incident, the platform surfaced the activity and AllTech's team was brought in directly to assist with operations and remediation, working alongside the state.

## The response window

The alert was detected, handled, and closed in approximately 15 minutes. By the time the incident was resolved, the attacker had not established lasting persistence or exfiltrated data. There was no ransomware deployment, data loss, or downtime for the department.

That outcome should not be read as proof that the attack was harmless. The command had already progressed beyond a misleading prompt: it had downloaded a file, used a legitimate Windows execution path, and attempted multiple persistence mechanisms. It was stopped before those efforts became durable.

For a small department, that timing can be the practical difference between a contained security event and a prolonged recovery effort. The first visible action in a ClickFix attack may take only seconds. The important work is recognizing what follows and responding while the attack is still in motion.

## The practical takeaway

There was nothing exotic about the building blocks in this incident. The attacker relied on a familiar social-engineering prompt, a command interpreter, a download, and Windows components that already existed on the workstation. The sophistication was in how those pieces were combined to obscure intent and create a path toward persistence.

Small departments should not have to identify that pattern by manually reviewing command lines, file paths, scheduled tasks, and registry changes after the fact. The meaningful protection in this case came from real-time visibility, correlation across the activity, and people ready to respond immediately.

Technology produced the signal. A human team helped turn that signal into a resolved incident before it became lasting access.

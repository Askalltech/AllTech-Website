/**
 * Static copy for the "AllTech System Telemetry" footer Easter egg.
 * Kept separate from src/components/SystemTelemetry.tsx so the joke text
 * can be edited without touching interaction logic.
 */

export type TelemetryState = "ok" | "warn" | "danger" | "pending";

export interface TelemetryLine {
  text: string;
  state: TelemetryState;
}

/** The panel's static status list — shown every time, never changes. */
export const TELEMETRY_LINES: TelemetryLine[] = [
  { text: "Core infrastructure: Operational", state: "ok" },
  { text: "Network monitoring: Operational", state: "ok" },
  { text: "Backups: Verified", state: "ok" },
  { text: "Security posture: Vigilant", state: "ok" },
  { text: "Printer diplomacy: Fragile", state: "warn" },
  { text: "Caffeine availability: Below SLA", state: "warn" },
  { text: "Humans: Pending reboot", state: "pending" },
];

export interface DiagnosticStep {
  label: string;
  result: string;
  state: TelemetryState;
}

/** Revealed one at a time by "Run diagnostics". */
export const DIAGNOSTIC_STEPS: DiagnosticStep[] = [
  { label: "Checking WAN uplink...", result: "OK", state: "ok" },
  { label: "Checking DNS resolution...", result: "OK", state: "ok" },
  { label: "Validating backup integrity...", result: "OK", state: "ok" },
  { label: "Scanning for rogue DHCP servers...", result: "NOT TODAY", state: "warn" },
  { label: "Checking printer status...", result: "UNRESOLVED", state: "warn" },
  { label: "Checking human availability...", result: "2/5 RESPONDING", state: "warn" },
  { label: "Checking caffeine reserves...", result: "CRITICAL", state: "danger" },
];

export const DIAGNOSTICS_RESULT = "Result: Infrastructure healthy.";
export const DIAGNOSTICS_RECOMMENDATION = "Recommendation: Reboot humans and re-test.";

/** One is picked at random each "Attempt human reboot" click. */
export const HUMAN_REBOOT_RESPONSES: string[] = [
  "Reboot request received. Waiting for humans to save their work...",
  "Error 418: Human is temporarily a teapot.",
  "Reboot deferred: Human insists ‘it was working five minutes ago.’",
  "Update available: Rest, hydration, and a 15-minute walk. Caffeine patch available. Install now? Yes.",
  "Human reboot complete. New uptime estimate: 47 minutes.",
  "Change window denied. Reason: ‘Just one more email.’",
];

/**
 * Rotates through the footer trigger label on each subsequent panel open
 * (session-scoped — see useTelemetryEscalation). Index 0 is never shown as
 * an escalation message; it's the default "All systems operational" label.
 */
export const ESCALATION_MESSAGES: string[] = [
  "All systems nominal. Humans: pending reboot.",
  "Human CPU utilization: 97%. Background tabs: 43.",
  "Memory leak detected: unresolved tickets, grocery lists, and 2007 song lyrics.",
  "Patch Tuesday has been postponed until after snacks.",
  "Incident declared: printer has developed opinions.",
  "Status page entering maintenance mode. Please enjoy this small, professionally approved panic.",
];

export const DEFAULT_TRIGGER_LABEL = "All systems operational";

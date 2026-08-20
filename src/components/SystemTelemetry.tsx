"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  DIAGNOSTICS_RECOMMENDATION,
  DIAGNOSTICS_RESULT,
  DIAGNOSTIC_STEPS,
  ESCALATION_MESSAGES,
  HUMAN_REBOOT_RESPONSES,
  TELEMETRY_LINES,
  type TelemetryState,
} from "@/lib/telemetry";

/** Delay between each diagnostics line revealing, when motion isn't reduced. */
const STEP_DELAY_MS = 220;

/** How often the footer pill auto-advances to the next TELEMETRY_LINES entry. */
const CYCLE_INTERVAL_MS = 10_000;

const STATE_COLOR: Record<TelemetryState, string> = {
  ok: "var(--color-success)",
  warn: "var(--color-warning)",
  danger: "var(--color-danger)",
  pending: "var(--color-text-muted)",
};

/** ● for settled states, ◐ for the one line that's still "in progress" —
 * a second signal beyond color, so status isn't color-only. */
const STATE_GLYPH: Record<TelemetryState, string> = {
  ok: "●",
  warn: "●",
  danger: "●",
  pending: "◐",
};

const SESSION_KEY = "alltech-telemetry-opens";

/** Reads/writes the session-scoped open count used to rotate the footer's
 * escalation label. sessionStorage can throw (privacy mode, disabled
 * storage) — every access is guarded and falls back to in-memory state so
 * the feature degrades to "no escalation" rather than breaking. */
function readOpenCount(): number {
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    return raw ? Number.parseInt(raw, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

function writeOpenCount(count: number) {
  try {
    window.sessionStorage.setItem(SESSION_KEY, String(count));
  } catch {
    // Storage unavailable — escalation just won't persist. Not fatal.
  }
}

function StatusLine({ text, state }: { text: string; state: TelemetryState }) {
  return (
    <div className="flex items-baseline gap-2 font-mono text-[13px] leading-relaxed">
      <span aria-hidden="true" style={{ color: STATE_COLOR[state] }}>
        {STATE_GLYPH[state]}
      </span>
      <span style={{ color: "var(--color-text-default)" }}>{text}</span>
    </div>
  );
}

type OutputMode = "diagnostics" | "reboot" | null;

const SystemTelemetry = () => {
  const [open, setOpen] = useState(false);
  const [openCount, setOpenCount] = useState(0);
  // Non-null while an ESCALATION_MESSAGES click-escalation is showing;
  // overrides the auto-cycled TELEMETRY_LINES text until the next tick.
  const [triggerLabel, setTriggerLabel] = useState<string | null>(null);
  const [cycleIndex, setCycleIndex] = useState(0);

  const [outputMode, setOutputMode] = useState<OutputMode>(null);
  const [revealedSteps, setRevealedSteps] = useState(0);
  const [diagnosticsRunning, setDiagnosticsRunning] = useState(false);
  const [diagnosticsDone, setDiagnosticsDone] = useState(false);
  const [rebootMessage, setRebootMessage] = useState<string | null>(null);

  const diagnosticsTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const lastRebootIndex = useRef<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const reducedMotion = useReducedMotion();

  // Session-scoped open count, read once on mount.
  useEffect(() => {
    setOpenCount(readOpenCount());
  }, []);

  // Auto-cycle the footer pill through TELEMETRY_LINES at rest. Paused
  // while the dialog is open (so text isn't silently changing behind it)
  // and skipped entirely under prefers-reduced-motion, since this is a
  // repeating, unprompted UI change — exactly what that preference exists
  // to suppress.
  useEffect(() => {
    if (open || reducedMotion) return;
    const id = setInterval(() => {
      // A click's escalation message has had its moment; the next tick
      // both advances the cycle and lets it take back over the pill.
      setTriggerLabel(null);
      setCycleIndex((i) => (i + 1) % TELEMETRY_LINES.length);
    }, CYCLE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [open, reducedMotion]);

  useEffect(() => {
    return () => {
      diagnosticsTimers.current.forEach(clearTimeout);
    };
  }, []);

  const clearDiagnosticsTimers = () => {
    diagnosticsTimers.current.forEach(clearTimeout);
    diagnosticsTimers.current = [];
  };

  const openPanel = () => {
    if (open) return;
    const next = openCount + 1;
    setOpenCount(next);
    writeOpenCount(next);
    // Index 0 stays the default label; every open after that rotates
    // through ESCALATION_MESSAGES, cycling back after the sixth.
    setTriggerLabel(ESCALATION_MESSAGES[(next - 1) % ESCALATION_MESSAGES.length]);
    setOpen(true);
  };

  const resetOutput = () => {
    clearDiagnosticsTimers();
    setOutputMode(null);
    setDiagnosticsRunning(false);
    setDiagnosticsDone(false);
    setRevealedSteps(0);
    setRebootMessage(null);
  };

  const runDiagnostics = () => {
    clearDiagnosticsTimers();
    setOutputMode("diagnostics");
    setRebootMessage(null);
    setDiagnosticsRunning(true);
    setDiagnosticsDone(false);
    setRevealedSteps(0);

    if (reducedMotion) {
      setRevealedSteps(DIAGNOSTIC_STEPS.length);
      setDiagnosticsRunning(false);
      setDiagnosticsDone(true);
      return;
    }

    DIAGNOSTIC_STEPS.forEach((_, i) => {
      const t = setTimeout(() => setRevealedSteps(i + 1), STEP_DELAY_MS * (i + 1));
      diagnosticsTimers.current.push(t);
    });
    const finish = setTimeout(
      () => {
        setDiagnosticsRunning(false);
        setDiagnosticsDone(true);
      },
      STEP_DELAY_MS * (DIAGNOSTIC_STEPS.length + 1),
    );
    diagnosticsTimers.current.push(finish);
  };

  const attemptHumanReboot = () => {
    clearDiagnosticsTimers();
    setOutputMode("reboot");
    setDiagnosticsRunning(false);

    let idx = Math.floor(Math.random() * HUMAN_REBOOT_RESPONSES.length);
    if (
      HUMAN_REBOOT_RESPONSES.length > 1 &&
      idx === lastRebootIndex.current
    ) {
      idx = (idx + 1) % HUMAN_REBOOT_RESPONSES.length;
    }
    lastRebootIndex.current = idx;
    setRebootMessage(HUMAN_REBOOT_RESPONSES[idx]);
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      // Panel content persists across opens by design (spec: "preserve the
      // panel's status content"); only clear in-flight diagnostics timers
      // so a reopen doesn't finish a run nobody's watching.
      clearDiagnosticsTimers();
      setDiagnosticsRunning(false);
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={openPanel}
        className="inline-flex items-center gap-1.5 text-left transition hover:text-[var(--color-text-primary)]"
        aria-haspopup="dialog"
        aria-label="Site status"
        title="Site status"
      >
        <span
          aria-hidden="true"
          className="inline-block size-1.5 rounded-full"
          style={{ background: STATE_COLOR[TELEMETRY_LINES[cycleIndex].state] }}
        />
        {triggerLabel ?? TELEMETRY_LINES[cycleIndex].text}
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="max-w-md gap-5 font-mono"
          style={{ background: "var(--color-bg-surface)", borderColor: "var(--color-border-default)" }}
          // Radix normally restores focus to whatever was focused before the
          // dialog opened on its own, but that path is timing-dependent on
          // the close animation finishing — and this project's Dialog
          // component ships animate-in/out classes from tw-animate-css
          // without that package's stylesheet actually being imported
          // (checked: not in global.css), so the animation never fires and
          // the restore was flaky in testing. Doing it explicitly here is
          // deterministic regardless of that.
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            triggerRef.current?.focus();
          }}
        >
          <DialogHeader>
            <DialogTitle
              className="font-mono text-base tracking-wide uppercase"
              style={{ color: "var(--color-text-primary)" }}
            >
              AllTech System Telemetry
            </DialogTitle>
            <DialogDescription className="text-xs" style={{ color: "var(--color-amber-600)" }}>
              Unofficial diagnostic simulation
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1">
            {TELEMETRY_LINES.map((line) => (
              <StatusLine key={line.text} text={line.text} state={line.state} />
            ))}
          </div>

          <div
            className="space-y-0.5 text-[11px]"
            style={{ color: "var(--color-text-subtle)" }}
          >
            <div>Last checked: Just now</div>
            <div>Next maintenance window: After lunch</div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              onClick={runDiagnostics}
              disabled={diagnosticsRunning}
            >
              Run diagnostics
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={attemptHumanReboot}
              disabled={diagnosticsRunning}
            >
              Attempt human reboot
            </Button>
            {outputMode && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={resetOutput}
                className="ml-auto"
              >
                Clear output
              </Button>
            )}
          </div>

          {outputMode && (
            <div
              role="status"
              aria-live="polite"
              className="rounded-md p-3 text-[12px]"
              style={{ background: "var(--color-bg-tint)", border: "1px solid var(--color-border-subtle)" }}
            >
              <div
                className="mb-1.5 text-[10px] font-medium tracking-wider uppercase"
                style={{ color: "var(--color-text-subtle)" }}
              >
                Output
              </div>

              {outputMode === "diagnostics" && (
                <div className="space-y-1">
                  {DIAGNOSTIC_STEPS.slice(0, revealedSteps).map((step) => (
                    <div key={step.label} className="flex items-center justify-between gap-3">
                      <span style={{ color: "var(--color-text-default)" }}>{step.label}</span>
                      <span
                        className="shrink-0 font-semibold"
                        style={{ color: STATE_COLOR[step.state] }}
                      >
                        {step.result}
                      </span>
                    </div>
                  ))}
                  {diagnosticsDone && (
                    <div className="mt-2 space-y-0.5" style={{ color: "var(--color-text-primary)" }}>
                      <div>{DIAGNOSTICS_RESULT}</div>
                      <div>{DIAGNOSTICS_RECOMMENDATION}</div>
                    </div>
                  )}
                </div>
              )}

              {outputMode === "reboot" && rebootMessage && (
                <div style={{ color: "var(--color-text-primary)" }}>{rebootMessage}</div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export { SystemTelemetry };

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import {
  domains,
  scoreAssessment,
  type Answer,
} from '~/lib/assessment';

type Status = 'idle' | 'submitting' | 'success' | 'error';

interface Props {
  turnstileSiteKey?: string;
}

const inputStyles =
  'w-full rounded-md px-3.5 py-2.5 transition-colors ' +
  'placeholder:text-[color:var(--color-text-tertiary)] ' +
  'focus:outline-none focus:ring-2';

const inputInlineStyle: React.CSSProperties = {
  background: 'var(--color-surface-0)',
  color: 'var(--color-text-primary)',
  border: '1px solid var(--color-line-soft)',
};

const labelInlineStyle: React.CSSProperties = {
  color: 'var(--color-text-secondary)',
};

const ANSWERS: { value: Answer; label: string }[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unsure', label: 'Not sure' },
];

/** How long the completed-domain highlight shows before auto-advancing. */
const AUTO_ADVANCE_MS = 350;

declare global {
  interface Window {
    turnstile?: {
      render(el: HTMLElement, opts: { sitekey: string; theme?: string }): string;
      remove(id: string): void;
    };
  }
}

export default function AssessmentForm({ turnstileSiteKey }: Props) {
  // step 0..domains.length-1 = one domain each; domains.length = results + contact.
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const onResults = step >= domains.length;
  const score = useMemo(() => scoreAssessment(answers), [answers]);

  // Pending auto-advance timer. Held in a ref so "← Back" (or unmounting)
  // can cancel it — previously the id was discarded, so going back within
  // the 350 ms window still fired and yanked the user forward again.
  const advanceTimer = useRef<number | null>(null);
  const clearAdvance = () => {
    if (advanceTimer.current !== null) {
      window.clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
  };
  useEffect(() => clearAdvance, []);

  // Turnstile is rendered EXPLICITLY, not via the usual `class="cf-turnstile"`
  // auto-render.
  //
  // This page is prerendered (output: 'static'), so the HTML the Turnstile
  // script scans on load is step 0 — the contact block, and with it the
  // widget container, doesn't exist yet. That one-shot scan never sees it and
  // never re-scans on DOM mutation, so the widget never mounted,
  // cf-turnstile-response was never populated, and the API rejected every
  // submission with "Captcha missing." The form was impossible to submit
  // whenever Turnstile was configured.
  //
  // Rendering on demand when the results step mounts also keeps the widget out
  // of the DOM entirely until it's actually needed.
  const turnstileRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!onResults || !turnstileSiteKey) return;
    const el = turnstileRef.current;
    if (!el) return;

    let widgetId: string | undefined;
    let cancelled = false;

    // The script is loaded `defer`, so it may not be ready the instant this
    // step mounts; poll briefly rather than racing it.
    const tryRender = () => {
      if (cancelled || !turnstileRef.current) return;
      if (window.turnstile) {
        widgetId = window.turnstile.render(turnstileRef.current, {
          sitekey: turnstileSiteKey,
          theme: 'light',
        });
      } else {
        pollTimer = window.setTimeout(tryRender, 100);
      }
    };
    let pollTimer = window.setTimeout(tryRender, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(pollTimer);
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, [onResults, turnstileSiteKey]);

  function setAnswer(id: string, value: Answer) {
    // Any pending auto-advance is stale the moment the user touches an answer.
    clearAdvance();

    const next = { ...answers, [id]: value };
    setAnswers(next);

    // Auto-advance the moment this answer completes the domain shown — but
    // only on that transition, so re-picking an answer after going back
    // doesn't yank the user forward again.
    //
    // This deliberately lives in the handler body, NOT inside the setAnswers
    // updater: updaters must be pure, and React double-invokes them under
    // StrictMode, which scheduled two timers and skipped a whole domain.
    if (!onResults) {
      const domain = domains[step];
      const wasComplete = domain.questions.every((q) => answers[q.id]);
      const isComplete = domain.questions.every((q) => next[q.id]);
      if (!wasComplete && isComplete) {
        advanceTimer.current = window.setTimeout(() => {
          advanceTimer.current = null;
          setStep((s) => s + 1);
        }, AUTO_ADVANCE_MS);
      }
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg('');

    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = (fd.get('name') ?? '').toString().trim();
    const company = (fd.get('company') ?? '').toString().trim();
    const email = (fd.get('email') ?? '').toString().trim();
    if (!name || !company || !email) {
      setStatus('error');
      setErrorMsg('Name, company, and email are required.');
      return;
    }

    setStatus('submitting');

    const payload = {
      name,
      email,
      phone: fd.get('phone'),
      company,
      answers,
      score: {
        overallPercent: score.overallPercent,
        domains: score.domains.map((d) => ({ id: d.id, label: d.label, percent: d.percent })),
      },
      company_website: fd.get('company_website'),
      'cf-turnstile-response': fd.get('cf-turnstile-response'),
    };

    try {
      const res = await fetch('/api/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Submission failed');
      }
      setStatus('success');
      form.reset();
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-8" role="status">
        <div
          className="inline-flex w-12 h-12 rounded-full items-center justify-center mb-4"
          style={{ background: 'var(--color-amber-glow)', color: 'var(--color-amber-600)' }}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-display text-2xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Thanks — we got your assessment.
        </h3>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Your results were sent to our team. A member of AllTech will reach out within one
          business day to walk through your gaps. For anything urgent, call{' '}
          <a href="tel:+14355573232" className="font-mono" style={{ color: 'var(--color-amber-600)' }}>
            (435) 557-3232
          </a>.
        </p>
      </div>
    );
  }

  // ----- Results + contact step -----
  if (onResults) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setStep(domains.length - 1)}
          className="text-sm font-medium mb-6 inline-flex items-center gap-1"
          style={{ color: 'var(--color-amber-600)' }}
        >
          ← Back to questions
        </button>

        <div className="rounded-lg p-6 mb-8 text-center" style={{ ...inputInlineStyle }}>
          <div className="eyebrow mb-2">Your security posture score</div>
          <div className="font-display font-bold leading-none" style={{ fontSize: '3.5rem', color: 'var(--color-amber-500)' }}>
            {score.overallPercent}%
          </div>
          <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>
            {score.idealCount} of {score.totalCount} controls at recommended posture
          </p>
        </div>

        <div className="space-y-2.5 mb-8">
          {score.domains.map((d) => (
            <div key={d.id} className="flex items-center gap-3">
              <div className="w-44 shrink-0 text-sm" style={{ color: 'var(--color-text-primary)' }}>{d.label}</div>
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-line-soft)' }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${d.percent}%`,
                    background: d.percent <= 70 ? 'var(--color-signal-error)' : 'var(--color-amber-500)',
                  }}
                />
              </div>
              <div className="w-10 text-right text-xs font-mono" style={{ color: 'var(--color-text-secondary)' }}>{d.percent}%</div>
            </div>
          ))}
        </div>

        {score.weakDomains.length > 0 && (
          <div className="rounded-md px-4 py-3 mb-8 text-sm" style={{ background: 'var(--color-amber-glow)', color: 'var(--color-text-primary)' }}>
            <span className="font-semibold">Areas to improve:</span>{' '}
            {score.weakDomains.map((d) => d.label).join(', ')}. We can help close these gaps.
          </div>
        )}

        <h3 className="font-display text-xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
          Send your results to our team
        </h3>
        <p className="text-sm mb-5" style={{ color: 'var(--color-text-secondary)' }}>
          Add your details and we'll review your assessment and follow up with tailored next steps.
        </p>

        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <div className="hidden" aria-hidden="true">
            <label>
              Leave this empty
              <input type="text" name="company_website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Name" name="name" required />
            <Field label="Company" name="company" required />
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Email" name="email" type="email" required />
            <Field label="Phone" name="phone" type="tel" />
          </div>

          {turnstileSiteKey && <div ref={turnstileRef} />}

          {status === 'error' && (
            <div
              role="alert"
              className="rounded-md px-4 py-3 text-sm"
              style={{
                background: 'rgba(220, 38, 38, 0.08)',
                border: '1px solid rgba(220, 38, 38, 0.3)',
                color: 'var(--color-signal-error)',
              }}
            >
              {errorMsg || 'Something went wrong. Please try again or call us directly.'}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="btn btn-primary w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {status === 'submitting' ? 'Sending…' : 'Send my results'}
            {status !== 'submitting' && <span aria-hidden="true">→</span>}
          </button>
        </form>
      </div>
    );
  }

  // ----- Domain question step -----
  const domain = domains[step];
  // step is 0-based, so this counts the step you're ON as progress made —
  // otherwise step 1 of 12 reads "0% complete" and the bar never fills.
  const progress = Math.round(((step + 1) / domains.length) * 100);

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs mb-2" style={{ color: 'var(--color-text-secondary)' }}>
          <span className="font-mono uppercase tracking-wider">Step {step + 1} of {domains.length}</span>
          <span>{progress}% complete</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-line-soft)' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: 'var(--color-amber-500)' }} />
        </div>
      </div>

      <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{domain.label}</h2>
      <p className="text-sm mb-6 mt-1" style={{ color: 'var(--color-text-secondary)' }}>{domain.blurb}</p>

      <div className="space-y-5">
        {domain.questions.map((q) => (
          <fieldset key={q.id}>
            <legend className="text-[15px] mb-2.5" style={{ color: 'var(--color-text-primary)' }}>{q.text}</legend>
            <div className="flex flex-wrap gap-2">
              {ANSWERS.map((a) => {
                const selected = answers[q.id] === a.value;
                return (
                  <label
                    key={a.value}
                    className="px-4 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--color-amber-400)] has-[:focus-visible]:ring-offset-2"
                    style={
                      selected
                        ? { background: 'var(--color-amber-400)', color: 'var(--color-ink-950)', border: '1px solid var(--color-amber-400)' }
                        : { ...inputInlineStyle }
                    }
                  >
                    <input
                      type="radio"
                      name={q.id}
                      value={a.value}
                      checked={selected}
                      onChange={() => setAnswer(q.id, a.value)}
                      className="sr-only"
                    />
                    {a.label}
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      <div className="flex items-center justify-between mt-8">
        <button
          type="button"
          onClick={() => {
            clearAdvance();
            setStep((s) => Math.max(0, s - 1));
          }}
          disabled={step === 0}
          className="btn btn-ghost disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ← Back
        </button>

        {/* Explicit forward control. Auto-advance only fires when every
            question in the domain is answered, so without this a user who
            wants to skip one is stranded with no way to reach the results. */}
        <button
          type="button"
          onClick={() => {
            clearAdvance();
            setStep((s) => s + 1);
          }}
          className="btn btn-ghost"
        >
          {step === domains.length - 1 ? 'See results' : 'Next'} →
        </button>
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}

function Field({ label, name, type = 'text', required }: FieldProps) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium mb-1.5" style={labelInlineStyle}>
        {label}
        {required && <span style={{ color: 'var(--color-signal-error)', marginLeft: '2px' }}>*</span>}
      </label>
      <input id={name} name={name} type={type} required={required} className={inputStyles} style={inputInlineStyle} />
    </div>
  );
}

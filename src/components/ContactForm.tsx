import { useState, useEffect, type FormEvent } from 'react';

type Status = 'idle' | 'submitting' | 'success' | 'error';

// Service options shown as checkboxes. "General inquiry" and "VoIP" were
// removed per the latest revision; "Other" was added.
const services = [
  'Managed IT',
  'Cybersecurity',
  'Cloudflare Zero Trust',
  'Network & Infrastructure',
  'Microsoft 365 / Cloud',
  'Backup & Disaster Recovery',
  'Penetration Testing',
  'Incident Response',
  'Utah Data Recovery',
  'Other',
];

/**
 * Inbound ?service= values that don't match an option above, mapped to the
 * one they mean. Keys are normalized (lowercase, alphanumerics only).
 * Anything not listed and not an exact option match simply prefills nothing.
 */
const SERVICE_ALIASES: Record<string, string> = {
  cloudflarezerotrust: 'Cloudflare Zero Trust',
  zerotrust: 'Cloudflare Zero Trust',
  sase: 'Cloudflare Zero Trust',
  fiberoptic: 'Network & Infrastructure',
  networkdevicecleaning: 'Network & Infrastructure',
  networkinfrastructure: 'Network & Infrastructure',
  networkdesign: 'Network & Infrastructure',
  itcloud: 'Managed IT',
  managedit: 'Managed IT',
  remoteitsupport: 'Managed IT',
  microsoft365cloud: 'Microsoft 365 / Cloud',
  cybersecurity: 'Cybersecurity',
  backupdisasterrecovery: 'Backup & Disaster Recovery',
  utahdatarecovery: 'Utah Data Recovery',
  generalinquiry: 'Other',
};

interface Props {
  defaultService?: string;
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

export default function ContactForm({ defaultService, turnstileSiteKey }: Props) {
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Which service checkboxes are ticked. Seeded from the `defaultService`
  // prop, then re-read from the URL on mount.
  //
  // The URL read is the part that actually does the work: the contact page is
  // prerendered (output: 'static'), so `Astro.url.searchParams` is empty at
  // build time and the prop always arrives undefined. Without this effect the
  // `?service=` deep links on every service page silently do nothing.
  const [checkedServices, setCheckedServices] = useState<string[]>(
    defaultService ? [defaultService] : [],
  );

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('service');
    if (!fromUrl) return;
    // Only honor values that resolve to a real option, so a stale or mistyped
    // link can't leave the form in a state the user didn't choose.
    //
    // Matching on the exact option string alone was too strict: several pages
    // link with a slug or a label that isn't in this list
    // (?service=cloudflare-zero-trust, "Fiber Optic", "Network Device
    // Cleaning", "General inquiry"), and every one of those silently prefilled
    // nothing. Normalizing and consulting an alias map fixes those without
    // loosening it into a fuzzy match.
    const normalize = (v: string) => v.toLowerCase().replace(/[^a-z0-9]/g, '');
    const target = normalize(fromUrl);
    const match =
      services.find((s) => normalize(s) === target) ??
      services.find((s) => normalize(s) === normalize(SERVICE_ALIASES[target] ?? ''));
    if (match) setCheckedServices((prev) => (prev.includes(match) ? prev : [...prev, match]));
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg('');

    const form = e.currentTarget;
    const fd = new FormData(form);
    const selectedServices = fd.getAll('services').map(String);
    const message = (fd.get('message') ?? '').toString().trim();

    // Name, company, and email are required (the form is noValidate, so the
    // `required` attribute alone won't block submission).
    const name = (fd.get('name') ?? '').toString().trim();
    const company = (fd.get('company') ?? '').toString().trim();
    const email = (fd.get('email') ?? '').toString().trim();
    if (!name || !company || !email) {
      setStatus('error');
      setErrorMsg('Name, company, and email are required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error');
      setErrorMsg('Enter a valid email address.');
      return;
    }

    // At least ONE of "What do you need help with?" or "Tell us more" must be
    // provided — not both. (Name + email are still required via the inputs.)
    if (selectedServices.length === 0 && !message) {
      setStatus('error');
      setErrorMsg('Pick at least one option or tell us more — we need at least one to point your message the right way.');
      return;
    }

    setStatus('submitting');

    const payload = {
      name: fd.get('name'),
      email: fd.get('email'),
      phone: fd.get('phone'),
      company: fd.get('company'),
      services: selectedServices,
      message,
      company_website: fd.get('company_website'),
      'cf-turnstile-response': fd.get('cf-turnstile-response'),
    };

    try {
      const res = await fetch('/api/contact', {
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
      window.turnstile?.reset();
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
          Thanks — we got it.
        </h3>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          A member of our team will reach out within one business day. For anything urgent,
          call us at{' '}
          <a href="tel:+14355573232" className="font-mono" style={{ color: 'var(--color-amber-600)' }}>
            (435) 557-3232
          </a>.
        </p>
      </div>
    );
  }

  return (
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

      <fieldset>
        <legend className="block text-sm font-medium mb-2" style={labelInlineStyle}>
          What do you need help with?
        </legend>
        <div className="grid sm:grid-cols-2 gap-2">
          {services.map((s) => (
            <label
              key={s}
              className="flex items-center gap-2.5 rounded-md px-3 py-2 cursor-pointer transition-colors"
              style={inputInlineStyle}
            >
              <input
                type="checkbox"
                name="services"
                value={s}
                checked={checkedServices.includes(s)}
                onChange={(e) =>
                  setCheckedServices((prev) =>
                    e.target.checked ? [...prev, s] : prev.filter((v) => v !== s),
                  )
                }
                className="h-4 w-4 rounded"
                style={{ accentColor: 'var(--color-amber-500)' }}
              />
              <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{s}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-1.5" style={labelInlineStyle}>
          Tell us more
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          placeholder="What's broken, what you're building, or what you're trying to figure out…"
          className={inputStyles + ' resize-y'}
          style={inputInlineStyle}
        />
        <p className="mt-1.5 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
          Fill out at least one of the options above or this field — you don't need both.
        </p>
      </div>

      {turnstileSiteKey && (
        <div className="cf-turnstile" data-sitekey={turnstileSiteKey} data-theme="light" />
      )}

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
        {status === 'submitting' ? 'Sending…' : 'Send message'}
        {status !== 'submitting' && <span aria-hidden="true">→</span>}
      </button>

      <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
        We typically respond within one business day. For emergencies, call{' '}
        <a href="tel:+14355573232" className="font-mono" style={{ color: 'var(--color-amber-600)' }}>
          (435) 557-3232
        </a>.
      </p>
    </form>
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
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className={inputStyles}
        style={inputInlineStyle}
      />
    </div>
  );
}

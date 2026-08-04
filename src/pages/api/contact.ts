import type { APIRoute } from 'astro';
import { sendEmail } from '~/lib/email';

/**
 * Opt out of prerendering — this needs to run server-side on Cloudflare.
 */
export const prerender = false;

interface ContactPayload {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  services?: string[]; // checkbox selections
  service?: string; // legacy single-select (kept for backward compatibility)
  message?: string;
  company_website?: string; // honeypot
  'cf-turnstile-response'?: string;
}

export const POST: APIRoute = async ({ request, locals }) => {
  let data: ContactPayload;
  try {
    data = await request.json();
  } catch {
    return json({ ok: false, message: 'Invalid JSON' }, 400);
  }

  // 1. Honeypot — silent reject so bots don't retry
  if (data.company_website) {
    return json({ ok: true });
  }

  // 2. Required fields — name, company, and email are always required.
  if (!data.name?.trim() || !data.company?.trim() || !data.email?.trim()) {
    return json({ ok: false, message: 'Name, company, and email are required.' }, 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return json({ ok: false, message: 'Please enter a valid email address.' }, 400);
  }

  // Normalize the service selection (new checkbox array, or legacy single value).
  const selectedServices = (data.services ?? (data.service ? [data.service] : []))
    .map((s) => s.trim())
    .filter(Boolean);

  // At least ONE of "what do you need help with?" (services) OR "tell us more"
  // (message) must be provided — not both.
  if (selectedServices.length === 0 && !data.message?.trim()) {
    return json(
      { ok: false, message: 'Tell us what you need help with — select at least one option or add a message.' },
      400,
    );
  }

  // 3. Turnstile verification (only if secret is configured)
  const env = locals.runtime?.env ?? {};
  if (env.TURNSTILE_SECRET) {
    const token = data['cf-turnstile-response'];
    if (!token) return json({ ok: false, message: 'Captcha missing.' }, 400);
    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: token }),
    });
    const verify = (await verifyRes.json()) as { success: boolean };
    if (!verify.success) {
      return json({ ok: false, message: 'Captcha failed. Please try again.' }, 400);
    }
  }

  // 4. Forward via Cloudflare Email Routing's Send Email binding (see
  //    src/lib/email.ts and the `send_email` block in wrangler.toml).
  //
  //    Routing note: help@askalltech.com is reserved for EXISTING customers.
  //    New/prospective inquiries from this form should go to the shared managers'
  //    inbox — set CONTACT_FORWARD_TO to that address (not help@).
  const servicesLabel = selectedServices.length ? selectedServices.join(', ') : 'General';
  const subject = `[Web Inquiry] ${servicesLabel} — ${data.name}`;
  const body = [
    `Services: ${selectedServices.length ? selectedServices.join(', ') : '—'}`,
    `Name:     ${data.name}`,
    `Email:    ${data.email}`,
    `Phone:    ${data.phone || '—'}`,
    `Company:  ${data.company || '—'}`,
    '',
    'Message:',
    data.message || '—',
  ].join('\n');

  await sendEmail({
    binding: env.SEND_EMAIL,
    to: env.CONTACT_FORWARD_TO,
    from: env.CONTACT_FROM,
    replyTo: data.email,
    subject,
    text: body,
  });

  return json({ ok: true });
};

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

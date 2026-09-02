import type { APIRoute } from 'astro';
import { EmailSendError, sendEmail } from '~/lib/email';
import {
  FIELD_LIMITS,
  cleanField,
  cleanServices,
  readJsonBody,
  validateContactFields,
} from '~/lib/formValidation';
import { verifyTurnstile } from '~/lib/turnstile';

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
  // 0. Bounded read — see MAX_BODY_BYTES in ~/lib/formValidation.
  const body = await readJsonBody<ContactPayload>(request);
  if (!body.ok) return json({ ok: false, message: body.message }, body.status);
  const data = body.data;

  // 1. Honeypot — silent reject so bots don't retry
  if (data.company_website) {
    return json({ ok: true });
  }

  // 2. Required fields — name, company, and email are always required.
  //    Values are trimmed and length-capped here, and these cleaned copies are
  //    what reach the email body (the raw payload is not used again).
  const contact = validateContactFields(data);
  if (!contact.ok) return json({ ok: false, message: contact.message }, contact.status);
  const { name, email, phone, company } = contact.fields;

  // Normalize the service selection (new checkbox array, or legacy single
  // value), allow-listed against the canonical option list.
  const selectedServices = cleanServices(data.services, data.service);
  const message = cleanField(data.message, FIELD_LIMITS.message);

  // At least ONE of "what do you need help with?" (services) OR "tell us more"
  // (message) must be provided — not both.
  if (selectedServices.length === 0 && !message) {
    return json(
      { ok: false, message: 'Tell us what you need help with — select at least one option or add a message.' },
      400,
    );
  }

  // 3. Turnstile — fails CLOSED when the public site key is configured but the
  //    secret isn't; see the policy note in ~/lib/turnstile.
  const env = locals.runtime?.env ?? {};
  const captcha = await verifyTurnstile({
    token: data['cf-turnstile-response'],
    secret: env.TURNSTILE_SECRET,
    remoteIp: request.headers.get('CF-Connecting-IP'),
  });
  if (!captcha.ok) return json({ ok: false, message: captcha.message }, captcha.status);

  // 4. Forward via Resend's REST API (see src/lib/email.ts for why — the
  //    Cloudflare Email Routing binding this used to use would have required
  //    taking over the domain's MX, conflicting with the live Cloudflare
  //    Email Security setup already in front of the real mailbox).
  //
  //    Routing note: help@askalltech.com is reserved for EXISTING customers.
  //    New/prospective inquiries from this form should go to the shared managers'
  //    inbox — set CONTACT_FORWARD_TO to that address (not help@).
  const servicesLabel = selectedServices.length ? selectedServices.join(', ') : 'General';
  const subject = `[Web Inquiry] ${servicesLabel} — ${name}`;
  const text = [
    `Services: ${selectedServices.length ? selectedServices.join(', ') : '—'}`,
    `Name:     ${name}`,
    `Email:    ${email}`,
    `Phone:    ${phone || '—'}`,
    `Company:  ${company || '—'}`,
    '',
    'Message:',
    message || '—',
  ].join('\n');

  try {
    await sendEmail({
      apiKey: env.RESEND_API_KEY,
      to: env.CONTACT_FORWARD_TO,
      from: env.CONTACT_FROM,
      replyTo: email,
      subject,
      text,
    });
  } catch (err) {
    if (err instanceof EmailSendError) {
      // Already logged with the full body in sendEmail — surface a clean error
      // rather than an unhandled 500.
      return json({ ok: false, message: 'Could not send your message. Please try again or call us.' }, 502);
    }
    throw err;
  }

  return json({ ok: true });
};

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

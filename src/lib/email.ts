/**
 * Shared sender for /api/contact and /api/assessment, built on Cloudflare's
 * own Email Routing "Send Email" binding — no third-party transactional
 * provider (Resend/Postmark/etc.) needed.
 *
 * Requires, per environment (see wrangler.toml):
 *   - a `send_email` binding named SEND_EMAIL
 *   - the `from` domain added and verified under Email Routing
 *   - the `to` address listed in that binding's `allowed_destination_addresses`
 *     (Cloudflare enforces this at the binding level, not just at send time)
 *
 * Locally (`astro dev`), the SSR code runs under plain Node rather than
 * workerd, which can't resolve the `cloudflare:email` built-in module at
 * all — platformProxy only simulates the *binding's presence/absence*, not
 * the runtime. So the import below is deferred until we already know a
 * binding exists (i.e. we're actually deployed on Cloudflare); dev without
 * the binding configured never touches it and just logs instead.
 */

import { createMimeMessage } from 'mimetext';

export interface SendEmailBinding {
  send(message: import('cloudflare:email').EmailMessage): Promise<void>;
}

interface SendEmailArgs {
  binding?: SendEmailBinding;
  to?: string;
  from?: string;
  replyTo?: string;
  subject: string;
  text: string;
}

export async function sendEmail({ binding, to, from, replyTo, subject, text }: SendEmailArgs) {
  if (!binding || !to || !from) {
    console.log(
      `[email] Not sent — SEND_EMAIL binding, CONTACT_FROM, or the forward-to address isn't configured.\n` +
        `To: ${to ?? '(unset)'}\nFrom: ${from ?? '(unset)'}\nSubject: ${subject}\n\n${text}`,
    );
    return;
  }

  const { EmailMessage } = await import('cloudflare:email');

  const msg = createMimeMessage();
  msg.setSender({ addr: from });
  msg.setRecipient(to);
  if (replyTo) msg.setHeader('Reply-To', replyTo);
  msg.setSubject(subject);
  msg.addMessage({ contentType: 'text/plain', data: text });

  await binding.send(new EmailMessage(from, to, msg.asRaw()));
}

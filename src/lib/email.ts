/**
 * Shared sender for /api/assessment, built on Resend's
 * REST API (https://resend.com/docs/api-reference/emails/send-email) via a
 * plain `fetch` call — no SDK dependency, since this runs in the Workers
 * runtime where a lightweight fetch is preferable to a Node-oriented client.
 *
 * Cloudflare's own "Send Email" Worker binding was tried first, but its
 * destination-address verification piggybacks on Cloudflare Email Routing,
 * which requires taking over the domain's MX records — askalltech.com's MX
 * is already Cloudflare Email Security, fronting the company's real mailbox
 * (Microsoft 365). Replacing that MX to satisfy a form-mail binding would
 * risk breaking live inbound company email, so Resend is used instead:
 * mail *sending* only needs SPF/DKIM (TXT/CNAME) records, which coexist with
 * any existing MX setup without touching it.
 *
 * Requires, per environment:
 *   - RESEND_API_KEY env var (a Resend API key)
 *   - CONTACT_FROM on a domain verified as a sending domain in Resend
 */

/** Thrown when the API key is present but the send itself failed. Routes
 * catch this and return a clean 502 rather than letting it escape as a 500. */
export class EmailSendError extends Error {
  constructor(readonly reason: unknown) {
    super('Email delivery failed');
    this.name = 'EmailSendError';
  }
}

interface SendEmailArgs {
  apiKey?: string;
  to?: string;
  from?: string;
  replyTo?: string;
  subject: string;
  text: string;
}

export async function sendEmail({ apiKey, to, from, replyTo, subject, text }: SendEmailArgs) {
  if (!apiKey || !to || !from) {
    console.log(
      `[email] Not sent — RESEND_API_KEY, CONTACT_FROM, or the forward-to address isn't configured.\n` +
        `To: ${to ?? '(unset)'}\nFrom: ${from ?? '(unset)'}\nSubject: ${subject}\n\n${text}`,
    );
    return;
  }

  let res: Response;
  try {
    res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        ...(replyTo ? { reply_to: replyTo } : {}),
        subject,
        text,
      }),
    });
  } catch (err) {
    console.error(
      `[email] Delivery FAILED (network error) — the inquiry below was not sent.\n` +
        `To: ${to}\nFrom: ${from}\nSubject: ${subject}\n\n${text}`,
      err,
    );
    throw new EmailSendError(err);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.error(
      `[email] Delivery FAILED (Resend ${res.status}) — the inquiry below was not sent.\n` +
        `To: ${to}\nFrom: ${from}\nSubject: ${subject}\n\n${text}\n\nResend response: ${body}`,
    );
    throw new EmailSendError(new Error(`Resend API returned ${res.status}: ${body}`));
  }
}

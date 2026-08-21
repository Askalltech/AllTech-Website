/**
 * Shared Cloudflare Turnstile verification for /api/contact and
 * /api/assessment.
 *
 * Both routes previously carried a near-identical copy of this logic, which is
 * how they drifted apart. It lives here now so there is one place to reason
 * about the fail-open/fail-closed policy.
 *
 * POLICY — fail closed when the widget is live:
 *   The client only renders the Turnstile widget when
 *   PUBLIC_TURNSTILE_SITE_KEY is set, and the server previously only verified
 *   when TURNSTILE_SECRET was set. Those two are configured independently, so
 *   a half-configured deploy (site key present, secret missing or scoped to
 *   the wrong environment) silently disabled captcha entirely and turned the
 *   endpoint into an open relay into the sales inbox — with no visible symptom.
 *
 *   So: if the site key is configured, the secret MUST be too. Otherwise the
 *   endpoint refuses to accept submissions at all. The two are either both
 *   present or the form is closed; there is no quiet middle state.
 *
 *   When NEITHER is set (local dev with no captcha configured), verification
 *   is skipped as before so the forms stay usable.
 */

export type TurnstileResult =
  | { ok: true }
  | { ok: false; status: number; message: string };

interface VerifyArgs {
  token?: string;
  secret?: string;
  /** Client IP, from the CF-Connecting-IP header. Optional but recommended. */
  remoteIp?: string | null;
}

/** Whether the public site key is configured — i.e. the widget renders and a
 * token is expected. Read at module scope: import.meta.env is inlined at build
 * time, so this cannot be read from the request-scoped runtime env. */
const siteKeyConfigured = Boolean(import.meta.env.PUBLIC_TURNSTILE_SITE_KEY);

export async function verifyTurnstile({ token, secret, remoteIp }: VerifyArgs): Promise<TurnstileResult> {
  if (!secret) {
    if (siteKeyConfigured) {
      // Half-configured: the browser is showing a widget whose answer nobody
      // can check. Refuse rather than accept unverified submissions.
      console.error(
        '[turnstile] PUBLIC_TURNSTILE_SITE_KEY is set but TURNSTILE_SECRET is not — ' +
          'refusing submissions. Set the secret for this environment.',
      );
      return { ok: false, status: 503, message: 'Form temporarily unavailable. Please try again shortly.' };
    }
    // Neither configured — captcha is genuinely off (local dev).
    return { ok: true };
  }

  if (!token) {
    return { ok: false, status: 400, message: 'Captcha missing.' };
  }

  let verifyRes: Response;
  try {
    verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret,
        response: token,
        ...(remoteIp ? { remoteip: remoteIp } : {}),
      }),
    });
  } catch (err) {
    console.error('[turnstile] siteverify request failed', err);
    return { ok: false, status: 502, message: 'Could not verify captcha. Please try again.' };
  }

  // A 5xx from Cloudflare returns HTML, not JSON — calling .json() on it
  // throws and escapes the route as an unhandled 500.
  if (!verifyRes.ok) {
    console.error(`[turnstile] siteverify returned HTTP ${verifyRes.status}`);
    return { ok: false, status: 502, message: 'Could not verify captcha. Please try again.' };
  }

  let verify: { success?: boolean };
  try {
    verify = (await verifyRes.json()) as { success?: boolean };
  } catch (err) {
    console.error('[turnstile] siteverify returned a non-JSON body', err);
    return { ok: false, status: 502, message: 'Could not verify captcha. Please try again.' };
  }

  if (!verify.success) {
    return { ok: false, status: 400, message: 'Captcha failed. Please try again.' };
  }

  return { ok: true };
}

/**
 * Shared request-body limits and field validation for /api/assessment.
 *
 * The assessment route previously bounded nothing: request.json() accepted an
 * unbounded body, no field had a length cap, and every value was interpolated
 * verbatim into the email subject/body. A caller that got past the honeypot
 * could push arbitrarily large payloads into the sales inbox.
 *
 * These are code-level caps only. Per-IP throttling is intentionally NOT here —
 * it belongs in a Cloudflare Rate Limiting rule at the edge (dashboard), which
 * needs no binding and no code.
 */

/** Hard ceiling on the raw request body. Generous next to the field caps
 * below — this only exists to stop a multi-megabyte POST from being parsed. */
export const MAX_BODY_BYTES = 64 * 1024; // 64 KB

export const FIELD_LIMITS = {
  name: 200,
  company: 200,
  phone: 200,
  email: 320, // RFC 5321 practical maximum
} as const;

/**
 * Reads the JSON body, rejecting anything over MAX_BODY_BYTES.
 *
 * Content-Length alone isn't trustworthy (it can be absent on a chunked
 * request), so the body is read as text and measured before parsing.
 */
export async function readJsonBody<T>(request: Request): Promise<
  { ok: true; data: T } | { ok: false; status: number; message: string }
> {
  const declared = request.headers.get('content-length');
  if (declared && Number(declared) > MAX_BODY_BYTES) {
    return { ok: false, status: 413, message: 'Request too large.' };
  }

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return { ok: false, status: 400, message: 'Could not read request body.' };
  }

  // Byte length, not string length — multibyte input would otherwise slip past.
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) {
    return { ok: false, status: 413, message: 'Request too large.' };
  }

  try {
    return { ok: true, data: JSON.parse(raw) as T };
  } catch {
    return { ok: false, status: 400, message: 'Invalid JSON' };
  }
}

/** Trims and truncates a possibly-untyped value to a string of at most `max`. */
export function cleanField(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

/** Shape of the assessment form's contact block. */
export interface ContactFields {
  name: string;
  email: string;
  phone: string;
  company: string;
}

/** Validates the name/company/email block the assessment route requires. */
export function validateContactFields(data: {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  company?: unknown;
}): { ok: true; fields: ContactFields } | { ok: false; status: number; message: string } {
  const fields: ContactFields = {
    name: cleanField(data.name, FIELD_LIMITS.name),
    email: cleanField(data.email, FIELD_LIMITS.email),
    phone: cleanField(data.phone, FIELD_LIMITS.phone),
    company: cleanField(data.company, FIELD_LIMITS.company),
  };

  if (!fields.name || !fields.company || !fields.email) {
    return { ok: false, status: 400, message: 'Name, company, and email are required.' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    return { ok: false, status: 400, message: 'Please enter a valid email address.' };
  }

  return { ok: true, fields };
}

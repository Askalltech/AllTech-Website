/**
 * Shared request-body limits and field validation for /api/contact and
 * /api/assessment.
 *
 * Neither route previously bounded anything: request.json() accepted an
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
  message: 5000,
  service: 200,
} as const;

/** Max number of entries accepted in the `services` array. */
export const MAX_SERVICES = 10;

/** Canonical service options — mirrors the checkbox list in
 * src/components/ContactForm.tsx. Submissions are allow-listed against this so
 * arbitrary attacker-chosen text can't reach the email subject line. */
export const SERVICE_OPTIONS = [
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
] as const;

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

/**
 * Normalizes the service selection from either the checkbox array or the
 * legacy single-value field, then allow-lists it.
 *
 * Previously this did `.map(s => s.trim())` on unvalidated input, so
 * `{"services":[1,2]}` threw `s.trim is not a function` as an unhandled 500,
 * and any arbitrary string reached the email subject.
 */
export function cleanServices(services: unknown, legacy: unknown): string[] {
  const raw: unknown[] = Array.isArray(services)
    ? services
    : typeof legacy === 'string' && legacy.trim()
      ? [legacy]
      : [];

  const allowed = new Set<string>(SERVICE_OPTIONS);
  const out: string[] = [];

  for (const entry of raw.slice(0, MAX_SERVICES)) {
    const value = cleanField(entry, FIELD_LIMITS.service);
    if (value && allowed.has(value) && !out.includes(value)) out.push(value);
  }
  return out;
}

/** Shape shared by both forms' contact block. */
export interface ContactFields {
  name: string;
  email: string;
  phone: string;
  company: string;
}

/** Validates the name/company/email block both routes require. */
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

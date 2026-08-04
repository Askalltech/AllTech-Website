import type { APIRoute } from 'astro';
import { domains, allQuestions, scoreAssessment, type Answer } from '~/lib/assessment';
import { sendEmail } from '~/lib/email';

/**
 * Opt out of prerendering — this needs to run server-side on Cloudflare.
 * Mirrors src/pages/api/contact.ts (honeypot, Turnstile, Cloudflare Send Email).
 */
export const prerender = false;

interface AssessmentPayload {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  answers?: Record<string, Answer>;
  company_website?: string; // honeypot
  'cf-turnstile-response'?: string;
}

export const POST: APIRoute = async ({ request, locals }) => {
  let data: AssessmentPayload;
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

  // Re-score server-side from the submitted answers (don't trust client math).
  const answers = (data.answers ?? {}) as Record<string, Answer>;
  const score = scoreAssessment(answers);

  // 4. Forward to SALES — the prospect's contact info + their score + every answer.
  //    Set ASSESSMENT_FORWARD_TO to the sales inbox (falls back to CONTACT_FORWARD_TO).
  //    Sent via the same Cloudflare Send Email binding as contact.ts (src/lib/email.ts).
  const labelFor = (id: string) => allQuestions.find((q) => q.id === id)?.text ?? id;
  const answerLabel: Record<Answer, string> = { yes: 'Yes', no: 'No', unsure: 'Not sure' };

  const domainLines = score.domains
    .map((d) => `  ${d.label}: ${d.percent}% (${d.ideal}/${d.total})`)
    .join('\n');

  const answerLines = domains
    .map((d) => {
      const rows = d.questions
        .map((q) => `    - ${labelFor(q.id)}\n        → ${answers[q.id] ? answerLabel[answers[q.id]] : '(no answer)'}`)
        .join('\n');
      return `  ${d.label}\n${rows}`;
    })
    .join('\n\n');

  const subject = `[Gap Assessment] ${score.overallPercent}% — ${data.company} (${data.name})`;
  const body = [
    `Overall score: ${score.overallPercent}% (${score.idealCount}/${score.totalCount} controls at recommended posture)`,
    '',
    'Contact:',
    `  Name:    ${data.name}`,
    `  Email:   ${data.email}`,
    `  Phone:   ${data.phone || '—'}`,
    `  Company: ${data.company}`,
    '',
    'Per-domain scores:',
    domainLines,
    '',
    score.weakDomains.length ? `Areas to improve: ${score.weakDomains.map((d) => d.label).join(', ')}` : 'No domains below threshold.',
    '',
    'Full responses:',
    answerLines,
  ].join('\n');

  await sendEmail({
    binding: env.SEND_EMAIL,
    to: env.ASSESSMENT_FORWARD_TO || env.CONTACT_FORWARD_TO,
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

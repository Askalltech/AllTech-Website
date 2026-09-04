import type { APIRoute } from 'astro';
import { domains, allQuestions, scoreAssessment, type Answer } from '~/lib/assessment';
import { EmailConfigurationError, EmailSendError, sendEmail } from '~/lib/email';
import { readJsonBody, validateContactFields } from '~/lib/formValidation';
import { verifyTurnstile } from '~/lib/turnstile';

/**
 * Opt out of prerendering — this needs to run server-side on Cloudflare.
 * Mirrors src/pages/api/contact.ts (honeypot, Turnstile, Resend delivery).
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
  // 0. Bounded read — see MAX_BODY_BYTES in ~/lib/formValidation.
  const body = await readJsonBody<AssessmentPayload>(request);
  if (!body.ok) return json({ ok: false, message: body.message }, body.status);
  const data = body.data;

  // 1. Honeypot — silent reject so bots don't retry
  if (data.company_website) {
    return json({ ok: true });
  }

  // 2. Required fields — name, company, and email are always required.
  //    Trimmed and length-capped; these cleaned copies are what reach the email.
  const contact = validateContactFields(data);
  if (!contact.ok) return json({ ok: false, message: contact.message }, contact.status);
  const { name, email, phone, company } = contact.fields;

  // 3. Turnstile — fails CLOSED when the public site key is configured but the
  //    secret isn't; see the policy note in ~/lib/turnstile.
  const env = locals.runtime?.env ?? {};
  const captcha = await verifyTurnstile({
    token: data['cf-turnstile-response'],
    secret: env.TURNSTILE_SECRET,
    remoteIp: request.headers.get('CF-Connecting-IP'),
  });
  if (!captcha.ok) return json({ ok: false, message: captcha.message }, captcha.status);

  // Re-score server-side from the submitted answers (don't trust client math).
  // Guard the shape too: only a plain object is usable, and only the known
  // answer values are kept, so a malformed payload scores as "no answer"
  // rather than reaching the email body as arbitrary text.
  const validAnswers = new Set<Answer>(['yes', 'no', 'unsure']);
  const rawAnswers =
    data.answers && typeof data.answers === 'object' && !Array.isArray(data.answers)
      ? (data.answers as Record<string, unknown>)
      : {};
  const answers: Record<string, Answer> = {};
  for (const q of allQuestions) {
    const value = rawAnswers[q.id];
    if (typeof value === 'string' && validAnswers.has(value as Answer)) {
      answers[q.id] = value as Answer;
    }
  }
  if (Object.keys(answers).length === 0) {
    return json({ ok: false, message: 'Answer at least one assessment question before submitting.' }, 400);
  }
  const score = scoreAssessment(answers);

  // 4. Forward to SALES — the prospect's contact info + their score + every answer.
  //    Set ASSESSMENT_FORWARD_TO to the sales inbox (falls back to CONTACT_FORWARD_TO).
  //    Sent via the same Resend REST call as contact.ts (src/lib/email.ts).
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

  const subject = `[Gap Assessment] ${score.overallPercent}% — ${company} (${name})`;
  const text = [
    `Overall score: ${score.overallPercent}% (${score.idealCount}/${score.totalCount} controls at recommended posture)`,
    '',
    'Contact:',
    `  Name:    ${name}`,
    `  Email:   ${email}`,
    `  Phone:   ${phone || '—'}`,
    `  Company: ${company}`,
    '',
    'Per-domain scores:',
    domainLines,
    '',
    score.weakDomains.length ? `Areas to improve: ${score.weakDomains.map((d) => d.label).join(', ')}` : 'No domains below threshold.',
    '',
    'Full responses:',
    answerLines,
  ].join('\n');

  try {
    await sendEmail({
      apiKey: env.RESEND_API_KEY,
      to: env.ASSESSMENT_FORWARD_TO || env.CONTACT_FORWARD_TO,
      from: env.CONTACT_FROM,
      replyTo: email,
      subject,
      text,
    });
  } catch (err) {
    if (err instanceof EmailConfigurationError) {
      return json(
        { ok: false, message: 'Assessment delivery is temporarily unavailable. Please call us instead.' },
        503,
      );
    }
    if (err instanceof EmailSendError) {
      return json({ ok: false, message: 'Could not send your results. Please try again or call us.' }, 502);
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

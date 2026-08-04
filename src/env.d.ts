/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

/**
 * Ambient type for Cloudflare's `cloudflare:email` built-in module, used by
 * src/lib/email.ts. Declared narrowly here (rather than pulling in the full
 * @cloudflare/workers-types package via tsconfig `types`) because that
 * package also redeclares DOM globals like `fetch`/`Response` for the whole
 * project, which broke type inference in browser-side components
 * (AssessmentForm.tsx, ContactForm.tsx) that run in the browser, not Workers.
 */
declare module 'cloudflare:email' {
  export class EmailMessage {
    constructor(from: string, to: string, raw: string);
    readonly from: string;
    readonly to: string;
    readonly raw: string;
  }
}

interface Env {
  TURNSTILE_SECRET?: string;
  CONTACT_FROM?: string;
  CONTACT_FORWARD_TO?: string;
  ASSESSMENT_FORWARD_TO?: string;
  SEND_EMAIL?: import('~/lib/email').SendEmailBinding;
}

declare namespace App {
  interface Locals extends Runtime {}
}

interface ImportMetaEnv {
  readonly PUBLIC_TURNSTILE_SITE_KEY?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

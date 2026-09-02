/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

interface Env {
  TURNSTILE_SECRET?: string;
  CONTACT_FROM?: string;
  CONTACT_FORWARD_TO?: string;
  ASSESSMENT_FORWARD_TO?: string;
  /** Resend API key — see src/lib/email.ts for why Resend, not Cloudflare's
   * own Send Email binding, is used to deliver contact/assessment mail. */
  RESEND_API_KEY?: string;
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

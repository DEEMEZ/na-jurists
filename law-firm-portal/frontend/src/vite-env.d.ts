/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  /** Optional main-site origin for “Load from website API” on reported judgments admin */
  readonly VITE_PUBLIC_WEBSITE_ORIGIN?: string;
  /** Alias for `VITE_PUBLIC_WEBSITE_ORIGIN` (production portal builds) */
  readonly VITE_WEBSITE_URL?: string;
  /** Local Next dev server origin for Vite `/api` proxy (defaults in vite.config) */
  readonly VITE_NEXT_DEV_ORIGIN?: string;
  /** Full client portal login URL for notification emails (optional override). */
  readonly VITE_PORTAL_LOGIN_URL?: string;
  /** @deprecated Portal uses Supabase; kept for older env files */
  readonly VITE_API_URL?: string;
}

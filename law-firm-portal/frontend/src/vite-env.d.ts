/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  /** Optional main-site origin for “Load from website API” on reported judgments admin */
  readonly VITE_PUBLIC_WEBSITE_ORIGIN?: string;
  /** @deprecated Portal uses Supabase; kept for older env files */
  readonly VITE_API_URL?: string;
}

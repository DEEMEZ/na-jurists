/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  /** @deprecated Portal uses Supabase; kept for older env files */
  readonly VITE_API_URL?: string;
}

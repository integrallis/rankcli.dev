/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_STRIPE_PUBLISHABLE_KEY?: string;
  readonly VITE_AUDIT_WORKER_URL?: string;
  readonly VITE_AUDIT_WORKER_SECRET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

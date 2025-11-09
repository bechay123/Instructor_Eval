import { createClient } from "@supabase/supabase-js"

// Load Supabase credentials from Vite environment variables.
// These should be set in your local `.env` (not committed) and in your
// deployment environment (Vercel/Netlify/etc.).
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  // Warn during development/build if the env vars are missing. Do NOT
  // hardcode secrets in source — instead set them in `.env` or the
  // hosting provider's environment variable settings.
  // eslint-disable-next-line no-console
  console.warn(
    "Missing Supabase environment variables. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env or deployment settings."
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Enable session persistence
    autoRefreshToken: true, // Automatically refresh the token
    detectSessionInUrl: true, // Detect session from URL (for OAuth/magic links)
  },
});


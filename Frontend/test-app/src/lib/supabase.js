const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let createClient = null;
try {
  // Keep Supabase optional for local/dev environments where the package isn't installed.
  const modName = "@supabase/supabase-js";
  const mod = await import(/* @vite-ignore */ modName);
  createClient = mod?.createClient ?? null;
} catch {
  createClient = null;
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && createClient);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    })
  : null;

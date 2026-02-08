import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const isPlaceholder = (value = "") =>
  value.includes("YOUR_PROJECT_ID") || value.includes("YOUR_SUPABASE_ANON_KEY")

export const supabaseStatus = {
  hasUrl: Boolean(supabaseUrl),
  hasKey: Boolean(supabaseAnonKey),
  usingPlaceholders: isPlaceholder(supabaseUrl || "") || isPlaceholder(supabaseAnonKey || ""),
}

export const isSupabaseConfigured =
  Boolean(supabaseUrl && supabaseAnonKey) && !supabaseStatus.usingPlaceholders

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    })
  : null

import { createClient } from "@supabase/supabase-js"

const readEnv = (key) => {
  const raw = import.meta.env[key]
  if (!raw) return ""
  const trimmed = `${raw}`.trim()
  return trimmed.replace(/^['"]|['"]$/g, "")
}

const supabaseUrl = readEnv("VITE_SUPABASE_URL")
const supabaseAnonKey = readEnv("VITE_SUPABASE_ANON_KEY")
const isPlaceholder = (value = "") =>
  value.includes("YOUR_PROJECT_ID") || value.includes("YOUR_SUPABASE_ANON_KEY")

export const supabaseStatus = {
  hasUrl: Boolean(supabaseUrl),
  hasKey: Boolean(supabaseAnonKey),
  usingPlaceholders: isPlaceholder(supabaseUrl || "") || isPlaceholder(supabaseAnonKey || ""),
}

export const isSupabaseConfigured =
  Boolean(supabaseUrl && supabaseAnonKey) && !supabaseStatus.usingPlaceholders

if (!isSupabaseConfigured) {
  console.warn("Supabase is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in environment variables.", supabaseStatus)
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    })
  : null

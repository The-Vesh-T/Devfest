import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const fileEnv = loadEnv(mode, process.cwd(), "")
  const env = { ...process.env, ...fileEnv }
  const supabaseUrl =
    env.VITE_SUPABASE_URL ||
    env.NEXT_PUBLIC_SUPABASE_URL ||
    env.SUPABASE_URL ||
    ""
  const supabaseAnonKey =
    env.VITE_SUPABASE_ANON_KEY ||
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    env.SUPABASE_ANON_KEY ||
    ""
  const geminiApiKey =
    env.VITE_GEMINI_API_KEY ||
    env.VITE_GEMINI_KEY ||
    env.NEXT_PUBLIC_GEMINI_API_KEY ||
    env.NEXT_PUBLIC_GEMINI_KEY ||
    env.GEMINI_API_KEY ||
    env.GEMINI_KEY ||
    ""

  return {
    plugins: [react()],
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(supabaseUrl),
      "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(supabaseAnonKey),
      "import.meta.env.VITE_GEMINI_API_KEY": JSON.stringify(geminiApiKey),
      "import.meta.env.VITE_GEMINI_KEY": JSON.stringify(geminiApiKey),
      "import.meta.env.NEXT_PUBLIC_GEMINI_API_KEY": JSON.stringify(geminiApiKey),
      "import.meta.env.NEXT_PUBLIC_GEMINI_KEY": JSON.stringify(geminiApiKey),
    },
  }
})

// src/lib/supabaseAdmin.ts
import { createClient } from '@supabase/supabase-js'

// Admin client: requires service key (server-only)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

export const supabaseAdmin = (supabaseUrl && supabaseServiceKey)
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    })
  : null

export const isAdminEnabled = () => !!(supabaseUrl && supabaseServiceKey && supabaseAdmin)

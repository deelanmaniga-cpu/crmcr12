import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_KEY

if(!url || !key){
  console.error('Supabase env vars missing')
}

export const supabase = createClient(url || '', key || '', {
  auth: { persistSession: false }
})

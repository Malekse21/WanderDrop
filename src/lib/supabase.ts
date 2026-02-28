import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string || 'placeholder-key';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn(
    '⚠️ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — create a .env file from .env.example'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

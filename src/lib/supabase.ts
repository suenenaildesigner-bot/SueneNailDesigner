import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

// Create a dummy client if creds are missing to avoid crash, but show warning
export const supabase = (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'YOUR_SUPABASE_URL')
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const checkSupabase = () => {
    if (!supabase) {
        console.warn('Supabase not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment/Secrets.');
        return false;
    }
    return true;
}

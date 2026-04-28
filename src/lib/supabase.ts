import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://epcwvlsahsrciiqbpjyi.supabase.co';
const supabaseAnonKey = 'Sb_publishable_cN_CILVrIopy10pjmJ56oQ_qY56oEyH';

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const checkSupabase = () => {
    return !!supabase;
}

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://epcwvlsahsrciiqbpjyi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwY3d2bHNhaHNyY2lpcWJwanlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMzc3MzAsImV4cCI6MjA5MjcxMzczMH0.I1qeRP3GzsYFGHvGAt5eFG7HPAYU_Ki_QOIJnC4E4Og';

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const checkSupabase = () => {
    return !!supabase;
}

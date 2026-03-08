import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("Initializing Supabase client with URL:", supabaseUrl);
console.log("Initializing Supabase client with Key length:", supabaseKey?.length || 0);

export const supabase = (supabaseUrl && supabaseKey)
    ? createClient(supabaseUrl, supabaseKey)
    : null;

if (!supabase) {
    console.error("CRITICAL: Supabase client failed to initialize. Check environment variables.");
} else {
    console.log("Supabase client initialized successfully.");
}

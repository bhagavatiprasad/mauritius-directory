import { createClient } from '@supabase/supabase-js';

const supabaseUrl = ((import.meta as any).env.VITE_SUPABASE_URL as string) || 'https://ryyymfdmqxobjxqupgut.supabase.co';
const supabaseAnonKey = ((import.meta as any).env.VITE_SUPABASE_ANON_KEY as string) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5eXltZmRtcXhvYmp4cXVwZ3V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MDI5NTEsImV4cCI6MjA5ODQ3ODk1MX0.Ig_GxYi43Vp9FQmsEiG2NXQz3BS41ubcomvF7rYb_CA';

// A safe check to verify if the client is fully and properly configured
export const isSupabaseConfigured = 
  !!supabaseUrl && 
  !!supabaseAnonKey && 
  supabaseUrl !== 'MY_SUPABASE_URL' && 
  supabaseAnonKey !== 'MY_SUPABASE_ANON_KEY' &&
  supabaseUrl.trim() !== '' &&
  supabaseAnonKey.trim() !== '';

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

console.log('Registry Status:', isSupabaseConfigured ? 'READY' : 'STANDARDIZED');

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = ((import.meta as any).env.VITE_SUPABASE_URL as string) || '';
const supabaseAnonKey = ((import.meta as any).env.VITE_SUPABASE_ANON_KEY as string) || '';

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

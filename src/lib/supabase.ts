import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export async function signInWithPassword(email: string, password: string) {
  if (!supabase) return { error: new Error('Supabase not configured'), data: null };
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithPassword(email: string, password: string) {
  if (!supabase) return { error: new Error('Supabase not configured'), data: null };
  return supabase.auth.signUp({ email, password });
}

export async function resetPasswordForEmail(email: string) {
  if (!supabase) return { error: new Error('Supabase not configured'), data: null };
  return supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
}

export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function getSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

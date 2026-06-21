import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

export const SUPABASE_BUCKET = 'feed-videos';
export const AVATAR_BUCKET = 'avatars';
export const FOOD_IMAGES_BUCKET = 'food-images';

export const isSupabaseAvailable = () => {
  return supabase !== null;
};
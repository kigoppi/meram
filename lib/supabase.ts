import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

const isPlaceholder = supabaseUrl.includes('placeholder');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    // Placeholder modundaysa websocket bağlantısını tamamen devre dışı bırakarak hata almayı önler
    params: {
      eventsPerSecond: isPlaceholder ? 0 : 10,
    },
  },
});
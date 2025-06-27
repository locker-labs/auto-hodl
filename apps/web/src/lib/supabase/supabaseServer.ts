import { createClient } from '@supabase/supabase-js';
import { SUPABASE_SERVICE_ROLE, SUPABASE_URL } from '@/config';

export const supabaseServer = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validar que as variáveis de ambiente existem
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Faltam variáveis de ambiente do Supabase!');
  console.error('Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env.local');
}

// Criar cliente Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

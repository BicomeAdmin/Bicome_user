
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// 單例模式，防止多個實例
let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        // 使用獨立的存儲鍵避免衝突
        storageKey: 'taiwan-community-auth',
        // 防止多個實例衝突
        persistSession: true,
        detectSessionInUrl: false,
      },
      // 防止重複初始化
      global: {
        headers: {
          'X-Client-Info': 'taiwan-community-circle',
        },
      },
    });
    
    console.log('✅ Supabase 客戶端已創建（單例模式）');
  }
  
  return supabaseInstance;
};

// 導出單例實例
export const supabase = getSupabaseClient();

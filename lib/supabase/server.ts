import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const createSupabaseServer = () => {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (key: string) => cookieStore.get(key)?.value,
        set: (key: string, value: string, opts: any) => cookieStore.set({ name:key, value, ...opts }),
        remove: (key: string, opts: any) => cookieStore.set({ name:key, value:'', ...opts })
      }
    }
  );
};

// Alias for backward compatibility
export const createClient = createSupabaseServer;
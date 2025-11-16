import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const createSupabaseServer = () => {
	const cookieStore = cookies();

	return createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() {
					return cookieStore.getAll().map((cookie) => ({
						name: cookie.name,
						value: cookie.value,
					}));
				},
				setAll(cookiesToSet) {
					cookiesToSet.forEach(({ name, value, options }) => {
						cookieStore.set({ name, value, ...options });
					});
				},
			},
		}
	);
};

// Alias for backward compatibility
export const createClient = createSupabaseServer;
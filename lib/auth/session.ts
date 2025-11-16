import { createSupabaseServer } from '@/lib/supabase/server';
import { Role } from "@/lib/types";

export async function getSession() {
  const supabase = createSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { session: null, profile: null };

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();

  return { session, profile };
}

export async function getUserRole(): Promise<Role | null> {
	const supabase = createSupabaseServer();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) return null;

	const { data, error } = await supabase
		.from("users")
		.select("role")
		.eq("id", user.id)
		.single();

	if (error || !data) return null;
	return data.role as Role;
}

export async function requireAuth() {
	const user = await getSession();
	if (!user) {
		throw new Error("Unauthorized");
	}
	return user;
}

export async function requireRole(allowedRoles: Role[]) {
	const role = await getUserRole();
	if (!role || !allowedRoles.includes(role)) {
		throw new Error("Forbidden");
	}
	return role;
}


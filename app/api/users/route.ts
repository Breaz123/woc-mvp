import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { Role } from "@/lib/types";
import { createSupabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
	try {
		// Allow all authenticated users to view users list (for directory)
		const supabase = createSupabaseServer();
		const { data, error } = await supabase
			.from("users")
			.select("*, team:teams(*), werkgroepen:user_werkgroepen(werkgroep:werkgroepen(*))")
			.order("name", { ascending: true });

		if (error) {
			console.error("Error fetching users:", error);
			return NextResponse.json({ error: "Fout bij ophalen gebruikers" }, { status: 500 });
		}

		// Transform users to include werkgroepen array
		const transformedUsers = data?.map((user: any) => ({
			...user,
			werkgroepen: user.werkgroepen?.map((uw: any) => uw.werkgroep) || [],
		})) || [];

		return NextResponse.json(transformedUsers);
	} catch (error: any) {
		return NextResponse.json({ error: "Fout bij ophalen gebruikers" }, { status: 500 });
	}
}

const userUpdateSchema = z.object({
	id: z.string().uuid(),
	role: z.enum(["Admin", "Kernlid", "Vrijwilliger"]),
	team_id: z.string().uuid().nullable().optional(),
});

const userCreateSchema = z.object({
	email: z.string().email("Ongeldig e-mailadres"),
	password: z.string().min(6, "Wachtwoord moet minimaal 6 tekens zijn"),
	role: z.enum(["Admin", "Kernlid", "Vrijwilliger"]).default("Vrijwilliger"),
	name: z.string().optional(),
	team_id: z.string().uuid().nullable().optional(),
});

// Helper om service role client te maken (voor admin operaties)
function createServiceRoleClient() {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
	const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
	
	if (!serviceRoleKey) {
		throw new Error("SUPABASE_SERVICE_ROLE_KEY niet gevonden in environment variabelen");
	}
	
	return createClient(supabaseUrl, serviceRoleKey, {
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
	});
}

export async function POST(request: NextRequest) {
	try {
		await requireRole([Role.Admin]);
		const body = await request.json();
		const { email, password, role, name, team_id } = userCreateSchema.parse(body);

		// Gebruik service role client voor admin operaties
		const supabaseAdmin = createServiceRoleClient();

		// 1. Maak auth user aan
		const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
			email,
			password,
			email_confirm: true, // Auto-confirm email
		});

		if (authError) {
			if (authError.message.includes("already registered")) {
				return NextResponse.json(
					{ error: "Dit e-mailadres is al geregistreerd" },
					{ status: 400 }
				);
			}
			return NextResponse.json(
				{ error: authError.message },
				{ status: 400 }
			);
		}

		if (!authData?.user) {
			return NextResponse.json(
				{ error: "Kon user niet aanmaken" },
				{ status: 500 }
			);
		}

		// 2. Maak user profile aan in users table
		const supabase = createSupabaseServer();
		const { error: profileError } = await supabase
			.from("users")
			.insert({
				id: authData.user.id,
				email,
				role,
				name: name || null,
				team_id: team_id || null,
			});

		if (profileError) {
			// Rollback: verwijder auth user als profile creation faalt
			await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
			return NextResponse.json(
				{ error: profileError.message },
				{ status: 400 }
			);
		}

		revalidatePath("/directory");
		revalidatePath("/admin");

		return NextResponse.json({ 
			success: true,
			user: {
				id: authData.user.id,
				email,
				role,
			}
		});
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json({ error: error.issues }, { status: 400 });
		}
		if (error instanceof Error && error.message.includes("SERVICE_ROLE_KEY")) {
			return NextResponse.json(
				{ error: "Server configuratie fout: SUPABASE_SERVICE_ROLE_KEY ontbreekt" },
				{ status: 500 }
			);
		}
		return NextResponse.json(
			{ error: "Server error" },
			{ status: 500 }
		);
	}
}

export async function PUT(request: NextRequest) {
	try {
		await requireRole([Role.Admin]);
		const body = await request.json();
		const { id, role, team_id } = userUpdateSchema.parse(body);

		const supabase = createSupabaseServer();

		const { error } = await supabase
			.from("users")
			.update({
				role,
				team_id: team_id || null,
			})
			.eq("id", id);

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		revalidatePath("/directory");

		return NextResponse.json({ success: true });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json({ error: error.issues }, { status: 400 });
		}
		return NextResponse.json(
			{ error: "Server error" },
			{ status: 500 }
		);
	}
}


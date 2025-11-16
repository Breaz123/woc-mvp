import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { Role } from "@/lib/types";
import { createSupabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const passwordVaultSchema = z.object({
	platform: z.string().min(1, "Platform is verplicht"),
	username: z.string().optional(),
	password: z.string().min(1, "Wachtwoord is verplicht"),
	url: z
		.string()
		.optional()
		.refine((val) => !val || val === "" || z.string().url().safeParse(val).success, {
			message: "Ongeldige URL",
		}),
	notes: z.string().optional(),
	visibility_admin: z.boolean().default(true),
	visibility_kernlid: z.boolean().default(false),
	visibility_custom: z.boolean().default(false),
	allowed_user_ids: z.array(z.string().uuid()).optional().default([]),
});

const passwordVaultUpdateSchema = passwordVaultSchema.extend({
	id: z.string().uuid(),
});

export async function GET(request: NextRequest) {
	try {
		await requireRole([Role.Admin, Role.Kernlid]);
		const supabase = createSupabaseServer();
		
		// RLS will handle visibility filtering
		const { data, error } = await supabase
			.from("password_vault")
			.select("*, password_vault_users(user_id)")
			.order("platform", { ascending: true });

		if (error) {
			console.error("Error fetching password vault:", error);
			return NextResponse.json({ error: "Fout bij ophalen password vault" }, { status: 500 });
		}

		// Transform data to include allowed_users array
		const transformedData = (data || []).map((entry: any) => ({
			...entry,
			allowed_users: entry.password_vault_users?.map((pu: any) => ({ user_id: pu.user_id })) || [],
		}));

		return NextResponse.json(transformedData);
	} catch (error: any) {
		if (error.message === "Forbidden") {
			return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
		}
		return NextResponse.json({ error: "Fout bij ophalen password vault" }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		await requireRole([Role.Admin]);
		const body = await request.json();
		const {
			platform,
			username,
			password,
			url,
			notes,
			visibility_admin,
			visibility_kernlid,
			visibility_custom,
			allowed_user_ids,
		} = passwordVaultSchema.parse(body);

		const supabase = createSupabaseServer();
		
		// Insert password vault entry
		const { data, error } = await supabase
			.from("password_vault")
			.insert({
				platform: platform.trim(),
				username: username?.trim() || null,
				password: password,
				url: url?.trim() || null,
				notes: notes?.trim() || null,
				visibility_admin: visibility_admin ?? true,
				visibility_kernlid: visibility_kernlid ?? false,
				visibility_custom: visibility_custom ?? false,
			})
			.select()
			.single();

		if (error) {
			console.error("Error creating password vault entry:", error);
			return NextResponse.json(
				{ error: "Fout bij aanmaken password vault entry" },
				{ status: 500 }
			);
		}

		// If custom visibility is enabled, insert user permissions
		if (visibility_custom && allowed_user_ids && allowed_user_ids.length > 0) {
			const userEntries = allowed_user_ids.map((userId) => ({
				password_vault_id: data.id,
				user_id: userId,
			}));

			const { error: usersError } = await supabase
				.from("password_vault_users")
				.insert(userEntries);

			if (usersError) {
				console.error("Error creating password vault user permissions:", usersError);
				// Clean up: delete the entry if user permissions fail
				await supabase.from("password_vault").delete().eq("id", data.id);
				return NextResponse.json(
					{ error: "Fout bij aanmaken gebruikersrechten" },
					{ status: 500 }
				);
			}
		}

		revalidatePath("/password-vault");
		return NextResponse.json({ ...data, allowed_users: allowed_user_ids?.map((id) => ({ user_id: id })) || [] }, { status: 201 });
	} catch (error: any) {
		if (error instanceof z.ZodError) {
			const firstIssue = error.issues[0];
			return NextResponse.json(
				{ error: firstIssue?.message || "Ongeldige gegevens" },
				{ status: 400 }
			);
		}
		if (error.message === "Forbidden") {
			return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
		}
		return NextResponse.json(
			{ error: "Fout bij aanmaken password vault entry" },
			{ status: 500 }
		);
	}
}

export async function PUT(request: NextRequest) {
	try {
		await requireRole([Role.Admin]);
		const body = await request.json();
		const {
			id,
			platform,
			username,
			password,
			url,
			notes,
			visibility_admin,
			visibility_kernlid,
			visibility_custom,
			allowed_user_ids,
		} = passwordVaultUpdateSchema.parse(body);

		const supabase = createSupabaseServer();
		
		// Update password vault entry
		const { data, error } = await supabase
			.from("password_vault")
			.update({
				platform: platform.trim(),
				username: username?.trim() || null,
				password: password,
				url: url?.trim() || null,
				notes: notes?.trim() || null,
				visibility_admin: visibility_admin ?? true,
				visibility_kernlid: visibility_kernlid ?? false,
				visibility_custom: visibility_custom ?? false,
			})
			.eq("id", id)
			.select()
			.single();

		if (error) {
			console.error("Error updating password vault entry:", error);
			return NextResponse.json(
				{ error: "Fout bij bijwerken password vault entry" },
				{ status: 500 }
			);
		}

		// Update user permissions: delete existing and insert new ones
		await supabase.from("password_vault_users").delete().eq("password_vault_id", id);

		if (visibility_custom && allowed_user_ids && allowed_user_ids.length > 0) {
			const userEntries = allowed_user_ids.map((userId) => ({
				password_vault_id: id,
				user_id: userId,
			}));

			const { error: usersError } = await supabase
				.from("password_vault_users")
				.insert(userEntries);

			if (usersError) {
				console.error("Error updating password vault user permissions:", usersError);
				return NextResponse.json(
					{ error: "Fout bij bijwerken gebruikersrechten" },
					{ status: 500 }
				);
			}
		}

		revalidatePath("/password-vault");
		return NextResponse.json({ ...data, allowed_users: allowed_user_ids?.map((id) => ({ user_id: id })) || [] });
	} catch (error: any) {
		if (error instanceof z.ZodError) {
			const firstIssue = error.issues[0];
			return NextResponse.json(
				{ error: firstIssue?.message || "Ongeldige gegevens" },
				{ status: 400 }
			);
		}
		if (error.message === "Forbidden") {
			return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
		}
		return NextResponse.json(
			{ error: "Fout bij bijwerken password vault entry" },
			{ status: 500 }
		);
	}
}

export async function DELETE(request: NextRequest) {
	try {
		await requireRole([Role.Admin]);
		const { searchParams } = new URL(request.url);
		const id = searchParams.get("id");

		if (!id) {
			return NextResponse.json({ error: "ID is verplicht" }, { status: 400 });
		}

		const supabase = createSupabaseServer();
		const { error } = await supabase.from("password_vault").delete().eq("id", id);

		if (error) {
			console.error("Error deleting password vault entry:", error);
			return NextResponse.json(
				{ error: "Fout bij verwijderen password vault entry" },
				{ status: 500 }
			);
		}

		revalidatePath("/password-vault");
		return NextResponse.json({ success: true });
	} catch (error: any) {
		if (error.message === "Forbidden") {
			return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
		}
		return NextResponse.json(
			{ error: "Fout bij verwijderen password vault entry" },
			{ status: 500 }
		);
	}
}


import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const postSignupSchema = z.object({
	shift_id: z.string().uuid("Ongeldige shift ID"),
});

export async function POST(request: NextRequest) {
	try {
		const supabase = createSupabaseServer();

		// Check session
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json(
				{ error: "Je moet ingelogd zijn om in te schrijven" },
				{ status: 401 }
			);
		}

		const body = await request.json();
		const { shift_id } = postSignupSchema.parse(body);

		// Haal shift op met max_slots
		const { data: shift, error: shiftError } = await supabase
			.from("shifts")
			.select("max_slots")
			.eq("id", shift_id)
			.single();

		if (shiftError || !shift) {
			return NextResponse.json(
				{ error: "Shift niet gevonden" },
				{ status: 404 }
			);
		}

		// Tel huidige signups voor deze shift
		const { count, error: countError } = await supabase
			.from("signups")
			.select("*", { count: "exact", head: true })
			.eq("shift_id", shift_id);

		if (countError) {
			return NextResponse.json(
				{ error: "Fout bij ophalen van inschrijvingen" },
				{ status: 500 }
			);
		}

		// Check of shift vol is
		if (count !== null && count >= shift.max_slots) {
			return NextResponse.json(
				{ error: "Deze shift is vol" },
				{ status: 400 }
			);
		}

		// Insert signup
		const { error: insertError } = await supabase
			.from("signups")
			.insert({
				shift_id,
				user_id: user.id,
			});

		if (insertError) {
			// Handle unique constraint violation (409 Conflict)
			if (
				insertError.code === "23505" ||
				insertError.message.includes("unique") ||
				insertError.message.includes("duplicate")
			) {
				return NextResponse.json(
					{ error: "Je bent al ingeschreven voor deze shift" },
					{ status: 409 }
				);
			}

			return NextResponse.json(
				{ error: insertError.message || "Fout bij inschrijven" },
				{ status: 400 }
			);
		}

		revalidatePath("/shifts");
		revalidatePath("/my-shifts");
		revalidatePath("/events/[id]", "page");

		return NextResponse.json({ success: true });
	} catch (error) {
		if (error instanceof z.ZodError) {
			const firstIssue = error.issues[0];
			return NextResponse.json(
				{
					error: firstIssue?.message || "Ongeldige gegevens",
				},
				{ status: 400 }
			);
		}

		return NextResponse.json(
			{ error: "Serverfout bij inschrijven" },
			{ status: 500 }
		);
	}
}

export async function DELETE(request: NextRequest) {
	try {
		const supabase = createSupabaseServer();

		// Check session
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json(
				{ error: "Je moet ingelogd zijn om uit te schrijven" },
				{ status: 401 }
			);
		}

		const { searchParams } = new URL(request.url);
		const id = searchParams.get("id");

		if (!id) {
			return NextResponse.json(
				{ error: "Inschrijving ID is verplicht" },
				{ status: 400 }
			);
		}

		// Validate UUID format
		const uuidSchema = z.string().uuid("Ongeldige inschrijving ID");
		uuidSchema.parse(id);

		// Delete signup (RLS zorgt dat alleen eigenaar kan deleten)
		const { error: deleteError } = await supabase
			.from("signups")
			.delete()
			.eq("id", id);

		if (deleteError) {
			return NextResponse.json(
				{ error: deleteError.message || "Fout bij uitschrijven" },
				{ status: 400 }
			);
		}

		revalidatePath("/shifts");
		revalidatePath("/my-shifts");
		revalidatePath("/events/[id]", "page");

		return NextResponse.json({ success: true });
	} catch (error) {
		if (error instanceof z.ZodError) {
			const firstIssue = error.issues[0];
			return NextResponse.json(
				{
					error: firstIssue?.message || "Ongeldige gegevens",
				},
				{ status: 400 }
			);
		}

		return NextResponse.json(
			{ error: "Serverfout bij uitschrijven" },
			{ status: 500 }
		);
	}
}

export async function GET(request: NextRequest) {
	try {
		const supabase = createSupabaseServer();

		const { searchParams } = new URL(request.url);
		const shift_id = searchParams.get("shift_id");

		if (!shift_id) {
			return NextResponse.json(
				{ error: "shift_id is verplicht" },
				{ status: 400 }
			);
		}

		// Validate UUID format
		const uuidSchema = z.string().uuid("Ongeldige shift ID");
		uuidSchema.parse(shift_id);

		// Get signups with user information
		const { data: signups, error: signupsError } = await supabase
			.from("signups")
			.select("*, user:users(*)")
			.eq("shift_id", shift_id)
			.order("created_at", { ascending: true });

		if (signupsError) {
			return NextResponse.json(
				{ error: signupsError.message || "Fout bij ophalen van inschrijvingen" },
				{ status: 400 }
			);
		}

		return NextResponse.json({ signups: signups || [] });
	} catch (error) {
		if (error instanceof z.ZodError) {
			const firstIssue = error.issues[0];
			return NextResponse.json(
				{
					error: firstIssue?.message || "Ongeldige gegevens",
				},
				{ status: 400 }
			);
		}

		return NextResponse.json(
			{ error: "Serverfout bij ophalen van inschrijvingen" },
			{ status: 500 }
		);
	}
}


import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { Role } from "@/lib/types";
import { createSupabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const shiftSchema = z.object({
	event_id: z.string().uuid("Ongeldige event ID"),
	title: z.string().min(1, "Titel is verplicht"),
	description: z.string().optional(),
	start_time: z.string().datetime("Ongeldige starttijd"),
	end_time: z.string().datetime("Ongeldige eindtijd"),
	max_slots: z.number().int().min(1, "Max slots moet minimaal 1 zijn"),
	id: z.string().uuid().optional(),
});

export async function POST(request: NextRequest) {
	try {
		await requireRole([Role.Admin, Role.Kernlid]);
		const body = await request.json();
		const { event_id, title, description, start_time, end_time, max_slots, id } =
			shiftSchema.parse(body);

		const supabase = createSupabaseServer();

		// Verify event exists
		const { data: event, error: eventError } = await supabase
			.from("events")
			.select("id")
			.eq("id", event_id)
			.single();

		if (eventError || !event) {
			return NextResponse.json(
				{ error: "Event niet gevonden" },
				{ status: 404 }
			);
		}

		if (id) {
			// Update existing
			const { error } = await supabase
				.from("shifts")
				.update({
					event_id,
					title,
					description,
					start_time,
					end_time,
					max_slots,
					updated_at: new Date().toISOString(),
				})
				.eq("id", id);

			if (error) {
				return NextResponse.json({ error: error.message }, { status: 400 });
			}
		} else {
			// Create new
			const { error } = await supabase.from("shifts").insert({
				event_id,
				title,
				description,
				start_time,
				end_time,
				max_slots,
			});

			if (error) {
				return NextResponse.json({ error: error.message }, { status: 400 });
			}
		}

		revalidatePath("/events");
		revalidatePath("/events/[id]", "page");
		revalidatePath("/shifts");

		return NextResponse.json({ success: true });
	} catch (error) {
		if (error instanceof z.ZodError) {
			const firstError = error.errors[0];
			return NextResponse.json(
				{ error: firstError?.message || "Ongeldige gegevens" },
				{ status: 400 }
			);
		}
		return NextResponse.json(
			{ error: "Serverfout" },
			{ status: 500 }
		);
	}
}

export async function DELETE(request: NextRequest) {
	try {
		await requireRole([Role.Admin, Role.Kernlid]);
		const { searchParams } = new URL(request.url);
		const id = searchParams.get("id");

		if (!id) {
			return NextResponse.json({ error: "ID is verplicht" }, { status: 400 });
		}

		const supabase = createSupabaseServer();
		const { error } = await supabase.from("shifts").delete().eq("id", id);

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		revalidatePath("/events");
		revalidatePath("/events/[id]", "page");
		revalidatePath("/shifts");

		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json(
			{ error: "Serverfout" },
			{ status: 500 }
		);
	}
}


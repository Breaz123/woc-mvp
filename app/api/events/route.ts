import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { Role } from "@/lib/types";
import { createSupabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const id = searchParams.get("id");

		if (!id) {
			return NextResponse.json({ error: "ID is verplicht" }, { status: 400 });
		}

		const supabase = createSupabaseServer();
		const { data, error } = await supabase
			.from("events")
			.select("id, title")
			.eq("id", id)
			.single();

		if (error || !data) {
			return NextResponse.json({ error: "Event niet gevonden" }, { status: 404 });
		}

		return NextResponse.json(data);
	} catch (error) {
		return NextResponse.json(
			{ error: "Serverfout" },
			{ status: 500 }
		);
	}
}

const eventSchema = z.object({
	title: z.string().min(1, "Titel is verplicht"),
	description: z.string().optional(),
	date: z.string().datetime("Ongeldige datum"),
	location: z.string().optional(),
	image_url: z.string().url().optional().or(z.literal("")),
	id: z.string().uuid().optional(),
});

export async function POST(request: NextRequest) {
	try {
		await requireRole([Role.Admin, Role.Kernlid]);
		const body = await request.json();
		const { title, description, date, location, image_url, id } =
			eventSchema.parse(body);

		const supabase = createSupabaseServer();

		if (id) {
			// Update existing
			const { error } = await supabase
				.from("events")
				.update({
					title,
					description,
					date,
					location,
					image_url: image_url || null,
					updated_at: new Date().toISOString(),
				})
				.eq("id", id);

			if (error) {
				return NextResponse.json({ error: error.message }, { status: 400 });
			}
		} else {
			// Create new
			const { error } = await supabase.from("events").insert({
				title,
				description,
				date,
				location,
				image_url: image_url || null,
			});

			if (error) {
				return NextResponse.json({ error: error.message }, { status: 400 });
			}
		}

		revalidatePath("/events");
		revalidatePath("/events/[id]", "page");

		return NextResponse.json({ success: true });
	} catch (error) {
		if (error instanceof z.ZodError) {
			const firstIssue = error.issues[0];
			return NextResponse.json(
				{ error: firstIssue?.message || "Ongeldige gegevens" },
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
		const { error } = await supabase.from("events").delete().eq("id", id);

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		revalidatePath("/events");
		revalidatePath("/events/[id]", "page");

		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json(
			{ error: "Serverfout" },
			{ status: 500 }
		);
	}
}


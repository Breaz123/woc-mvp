import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { Role } from "@/lib/types";
import { requireAuth } from "@/lib/auth/session";
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
			.from("news")
			.select("id, title")
			.eq("id", id)
			.single();

		if (error || !data) {
			return NextResponse.json({ error: "Nieuws niet gevonden" }, { status: 404 });
		}

		return NextResponse.json(data);
	} catch (error) {
		if (error instanceof Error) {
			return NextResponse.json(
				{ error: error.message || "Serverfout" },
				{ status: 500 }
			);
		}
		return NextResponse.json(
			{ error: "Serverfout" },
			{ status: 500 }
		);
	}
}

const newsSchema = z.object({
	title: z.string().min(1),
	content: z.string().min(1),
	image_url: z.union([z.string().url(), z.literal("")]).optional(),
	id: z.string().uuid().optional(),
});

export async function POST(request: NextRequest) {
	try {
		await requireRole([Role.Admin, Role.Kernlid]);
		const user = await requireAuth();
		const body = await request.json();
		const { title, content, image_url, id } = newsSchema.parse(body);

		const supabase = createSupabaseServer();

		if (id) {
			// Update existing
			const { error } = await supabase
				.from("news")
				.update({
					title,
					content,
					image_url: image_url || null,
					updated_at: new Date().toISOString(),
				})
				.eq("id", id);

			if (error) {
				return NextResponse.json({ error: error.message }, { status: 400 });
			}
		} else {
			// Create new
			if (!user.profile?.id) {
				return NextResponse.json({ error: "Gebruiker niet gevonden" }, { status: 401 });
			}
			const { error } = await supabase.from("news").insert({
				title,
				content,
				image_url: image_url || null,
				author_id: user.profile.id,
			});

			if (error) {
				return NextResponse.json({ error: error.message }, { status: 400 });
			}
		}

		revalidatePath("/news");

		return NextResponse.json({ success: true });
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errorMessages = error.issues
				.map((e) => `${e.path.join(".")}: ${e.message}`)
				.join(", ");
			return NextResponse.json({ error: `Validatiefout: ${errorMessages}` }, { status: 400 });
		}
		if (error instanceof Error) {
			return NextResponse.json(
				{ error: error.message || "Serverfout" },
				{ status: 500 }
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
			return NextResponse.json({ error: "ID required" }, { status: 400 });
		}

		const supabase = createSupabaseServer();
		const { error } = await supabase.from("news").delete().eq("id", id);

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		revalidatePath("/news");

		return NextResponse.json({ success: true });
	} catch (error) {
		if (error instanceof Error) {
			return NextResponse.json(
				{ error: error.message || "Serverfout" },
				{ status: 500 }
			);
		}
		return NextResponse.json(
			{ error: "Serverfout" },
			{ status: 500 }
		);
	}
}


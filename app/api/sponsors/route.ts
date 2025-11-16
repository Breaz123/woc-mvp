import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { Role } from "@/lib/types";
import { createSupabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Helper to normalize URLs - add https:// if missing
const normalizeUrl = (url: string): string => {
	if (!url) return url;
	url = url.trim();
	if (!url.startsWith("http://") && !url.startsWith("https://")) {
		return `https://${url}`;
	}
	return url;
};

const sponsorSchema = z.object({
	name: z.string().min(1),
	logo_url: z
		.string()
		.optional()
		.transform((val) => (val && val.trim() ? normalizeUrl(val.trim()) : undefined)),
	website_url: z
		.string()
		.optional()
		.transform((val) => (val && val.trim() ? normalizeUrl(val.trim()) : undefined)),
	description: z.string().optional(),
	id: z.string().uuid().optional(),
});

export async function POST(request: NextRequest) {
	try {
		await requireRole([Role.Admin]);
		const body = await request.json();
		const { name, logo_url, website_url, description, id } =
			sponsorSchema.parse(body);

		const supabase = createSupabaseServer();

		if (id) {
			// Update existing
			const { error } = await supabase
				.from("sponsors")
				.update({
					name,
					logo_url,
					website_url,
					description,
					updated_at: new Date().toISOString(),
				})
				.eq("id", id);

			if (error) {
				return NextResponse.json({ error: error.message }, { status: 400 });
			}
		} else {
			// Create new
			const { error } = await supabase.from("sponsors").insert({
				name,
				logo_url,
				website_url,
				description,
			});

			if (error) {
				return NextResponse.json({ error: error.message }, { status: 400 });
			}
		}

		revalidatePath("/sponsors");

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

export async function DELETE(request: NextRequest) {
	try {
		await requireRole([Role.Admin]);
		const { searchParams } = new URL(request.url);
		const id = searchParams.get("id");

		if (!id) {
			return NextResponse.json({ error: "ID required" }, { status: 400 });
		}

		const supabase = createSupabaseServer();
		const { error } = await supabase.from("sponsors").delete().eq("id", id);

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		revalidatePath("/sponsors");

		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json(
			{ error: "Server error" },
			{ status: 500 }
		);
	}
}


import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { Role } from "@/lib/types";
import { createSupabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const pageSchema = z.object({
	slug: z.string(),
	title: z.string().min(1),
	content: z.string().min(1),
});

export async function PUT(request: NextRequest) {
	try {
		await requireRole([Role.Admin]);
		const body = await request.json();
		const { slug, title, content } = pageSchema.parse(body);

		const supabase = createSupabaseServer();

		const { error } = await supabase
			.from("pages")
			.upsert(
				{
					slug,
					title,
					content,
					updated_at: new Date().toISOString(),
				},
				{
					onConflict: "slug",
				}
			);

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		revalidatePath(`/${slug}`);

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


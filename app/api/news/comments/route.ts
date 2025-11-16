import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { createSupabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const commentSchema = z.object({
	content: z.string().min(1),
	news_id: z.string().uuid(),
	id: z.string().uuid().optional(),
});

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const newsId = searchParams.get("news_id");

		if (!newsId) {
			return NextResponse.json({ error: "news_id is verplicht" }, { status: 400 });
		}

		const supabase = createSupabaseServer();
		const { data, error } = await supabase
			.from("news_comments")
			.select("*, user:users(*)")
			.eq("news_id", newsId)
			.order("created_at", { ascending: true });

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		return NextResponse.json(data);
	} catch (error) {
		return NextResponse.json(
			{ error: "Serverfout" },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const user = await requireAuth();
		if (!user.profile?.id) {
			return NextResponse.json({ error: "Gebruiker niet gevonden" }, { status: 401 });
		}

		const body = await request.json();
		const { content, news_id, id } = commentSchema.parse(body);

		const supabase = createSupabaseServer();

		if (id) {
			// Update existing
			const { error } = await supabase
				.from("news_comments")
				.update({
					content,
					updated_at: new Date().toISOString(),
				})
				.eq("id", id)
				.eq("user_id", user.profile.id); // Ensure user owns the comment

			if (error) {
				return NextResponse.json({ error: error.message }, { status: 400 });
			}
		} else {
			// Create new
			const { error } = await supabase.from("news_comments").insert({
				content,
				news_id,
				user_id: user.profile.id,
			});

			if (error) {
				return NextResponse.json({ error: error.message }, { status: 400 });
			}
		}

		revalidatePath(`/news/${news_id}`);

		return NextResponse.json({ success: true });
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errorMessages = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
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
		const user = await requireAuth();
		if (!user.profile?.id) {
			return NextResponse.json({ error: "Gebruiker niet gevonden" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const id = searchParams.get("id");

		if (!id) {
			return NextResponse.json({ error: "ID is verplicht" }, { status: 400 });
		}

		const supabase = createSupabaseServer();
		
		// Get comment to find news_id for revalidation
		const { data: comment } = await supabase
			.from("news_comments")
			.select("news_id")
			.eq("id", id)
			.eq("user_id", user.profile.id)
			.single();

		const { error } = await supabase
			.from("news_comments")
			.delete()
			.eq("id", id)
			.eq("user_id", user.profile.id); // Ensure user owns the comment

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		if (comment) {
			revalidatePath(`/news/${comment.news_id}`);
		}

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


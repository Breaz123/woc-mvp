import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { Role } from "@/lib/types";
import { createSupabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const werkgroepSchema = z.object({
	name: z.string().min(1),
	description: z.string().optional(),
	id: z.string().uuid().optional(),
});

export async function GET() {
	try {
		const supabase = createSupabaseServer();
		const { data, error } = await supabase
			.from("werkgroepen")
			.select("*")
			.order("name", { ascending: true });

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
		await requireRole([Role.Admin, Role.Kernlid]);
		const body = await request.json();
		const { name, description, id } = werkgroepSchema.parse(body);

		const supabase = createSupabaseServer();

		if (id) {
			// Update existing
			const { error } = await supabase
				.from("werkgroepen")
				.update({
					name,
					description: description || null,
					updated_at: new Date().toISOString(),
				})
				.eq("id", id);

			if (error) {
				return NextResponse.json({ error: error.message }, { status: 400 });
			}
		} else {
			// Create new
			const { error } = await supabase.from("werkgroepen").insert({
				name,
				description: description || null,
			});

			if (error) {
				return NextResponse.json({ error: error.message }, { status: 400 });
			}
		}

		revalidatePath("/directory");

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
		await requireRole([Role.Admin, Role.Kernlid]);
		const { searchParams } = new URL(request.url);
		const id = searchParams.get("id");

		if (!id) {
			return NextResponse.json({ error: "ID is verplicht" }, { status: 400 });
		}

		const supabase = createSupabaseServer();
		const { error } = await supabase.from("werkgroepen").delete().eq("id", id);

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		revalidatePath("/directory");

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


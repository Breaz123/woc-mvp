import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { Role } from "@/lib/types";
import { createSupabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const userWerkgroepSchema = z.object({
	user_id: z.string().uuid(),
	werkgroep_id: z.string().uuid(),
});

export async function POST(request: NextRequest) {
	try {
		await requireRole([Role.Admin, Role.Kernlid]);
		const body = await request.json();
		const { user_id, werkgroep_id } = userWerkgroepSchema.parse(body);

		const supabase = createSupabaseServer();

		const { error } = await supabase.from("user_werkgroepen").insert({
			user_id,
			werkgroep_id,
		});

		if (error) {
			// Handle unique constraint violation
			if (error.code === "23505" || error.message.includes("unique")) {
				return NextResponse.json({ error: "Lid is al toegevoegd aan deze werkgroep" }, { status: 400 });
			}
			return NextResponse.json({ error: error.message }, { status: 400 });
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
		const user_id = searchParams.get("user_id");
		const werkgroep_id = searchParams.get("werkgroep_id");

		if (!user_id || !werkgroep_id) {
			return NextResponse.json({ error: "user_id en werkgroep_id zijn verplicht" }, { status: 400 });
		}

		const supabase = createSupabaseServer();
		const { error } = await supabase
			.from("user_werkgroepen")
			.delete()
			.eq("user_id", user_id)
			.eq("werkgroep_id", werkgroep_id);

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


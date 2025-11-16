import { createSupabaseServer } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { EventDetail } from "@/components/EventDetail";
import { notFound } from "next/navigation";
import { Role } from "@/lib/types";

export default async function EventDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const supabase = createSupabaseServer();
	const { session, profile } = await getSession();

	const { data: event, error: eventError } = await supabase
		.from("events")
		.select("*")
		.eq("id", id)
		.single();

	if (eventError || !event) {
		notFound();
	}

	const { data: shifts } = await supabase
		.from("shifts")
		.select("*")
		.eq("event_id", id)
		.order("start_time", { ascending: true });

	// Get signups for these shifts
	const shiftIds = (shifts || []).map((s) => s.id);
	const { data: signups } = shiftIds.length
		? await supabase
				.from("signups")
				.select("*")
				.in("shift_id", shiftIds)
		: { data: [] };

	// Group signups by shift_id
	const signupsByShift = (signups || []).reduce(
		(acc, signup) => {
			if (!acc[signup.shift_id]) {
				acc[signup.shift_id] = [];
			}
			acc[signup.shift_id].push(signup);
			return acc;
		},
		{} as Record<string, typeof signups>
	);

	const canEdit =
		profile?.role === Role.Admin || profile?.role === Role.Kernlid;

	return (
		<div className="container mx-auto p-6">
			<EventDetail
				event={event}
				shifts={shifts || []}
				signupsByShift={signupsByShift}
				currentUserId={session?.user.id}
				canEdit={canEdit}
			/>
		</div>
	);
}

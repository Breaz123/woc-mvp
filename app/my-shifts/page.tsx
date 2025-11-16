import { getSession } from "@/lib/auth/session";
import { createSupabaseServer } from "@/lib/supabase/server";
import { ShiftCard } from "@/components/ShiftCard";
import { Signup, Shift } from "@/lib/types";
import Link from "next/link";

export default async function MyShiftsPage() {
	const { session, profile } = await getSession();
	if (!session) {
		return <div>Je moet ingelogd zijn om je shifts te bekijken</div>;
	}
	const supabase = createSupabaseServer();

	const { data: signups, error: signupsError } = await supabase
		.from("signups")
		.select("*, shift:shifts(*, event:events(*))")
		.eq("user_id", session.user.id)
		.order("created_at", { ascending: false });

	if (signupsError) {
		return <div>Fout bij laden van inschrijvingen</div>;
	}

	// Get all shift IDs and fetch their signup counts
	const shiftIds = (signups || []).map((s: Signup & { shift: Shift }) => s.shift.id);
	const { data: allShiftSignups } = shiftIds.length
		? await supabase
				.from("signups")
				.select("shift_id")
				.in("shift_id", shiftIds)
		: { data: [] };

	// Count signups per shift
	const signupCounts = (allShiftSignups || []).reduce(
		(acc, signup) => {
			acc[signup.shift_id] = (acc[signup.shift_id] || 0) + 1;
			return acc;
		},
		{} as Record<string, number>
	);

	return (
		<div className="container mx-auto p-6">
			<h1 className="text-3xl font-bold mb-6">Mijn Shifts</h1>
			{signups && signups.length > 0 ? (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{signups.map((signup: Signup & { shift: Shift }) => {
						const count = signupCounts[signup.shift.id] || 0;

						return (
							<Link
								key={signup.id}
								href={`/events/${signup.shift.event_id}`}
								className="block"
							>
								<ShiftCard
									shift={signup.shift}
									count={count}
									currentUserSignupId={signup.id}
								/>
							</Link>
						);
					})}
				</div>
			) : (
				<p>Je hebt nog geen shifts ingeschreven</p>
			)}
		</div>
	);
}


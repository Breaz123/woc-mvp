import { createSupabaseServer } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { ShiftCardWithDelete } from "@/components/ShiftCardWithDelete";
import { Shift, Signup, Role } from "@/lib/types";
import { PageTransition } from "@/components/PageTransition";
import { StaggerContainer } from "@/components/StaggerContainer";

export default async function ShiftsPage() {
	const supabase = createSupabaseServer();
	const { session, profile } = await getSession();
	const canEdit = profile?.role === Role.Admin || profile?.role === Role.Kernlid;

	const { data: shifts, error: shiftsError } = await supabase
		.from("shifts")
		.select("*, event:events(*)")
		.order("start_time", { ascending: true });

	if (shiftsError) {
		return <div>Fout bij laden van shifts</div>;
	}

	// Get all signups for these shifts
	const shiftIds = shifts?.map((s) => s.id) || [];
	const { data: signups } = shiftIds.length
		? await supabase
				.from("signups")
				.select("*, shift:shifts(*)")
				.in("shift_id", shiftIds)
		: { data: [] };

	// Group signups by shift_id
	const signupsByShift = (signups || []).reduce(
		(acc, signup: Signup) => {
			if (!acc[signup.shift_id]) {
				acc[signup.shift_id] = [];
			}
			acc[signup.shift_id].push(signup);
			return acc;
		},
		{} as Record<string, Signup[]>
	);

	// Group shifts by event
	const shiftsByEvent = (shifts || []).reduce(
		(acc, shift: Shift) => {
			const eventId = shift.event_id;
			if (!acc[eventId]) {
				acc[eventId] = {
					event: shift.event,
					shifts: [],
				};
			}
			acc[eventId].shifts.push(shift);
			return acc;
		},
		{} as Record<
			string,
			{ event: Shift["event"]; shifts: Shift[] }
		>
	);

	return (
		<PageTransition>
			<h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
				Shifts
			</h1>
			{Object.keys(shiftsByEvent).length > 0 ? (
				<div className="space-y-10">
					{Object.entries(shiftsByEvent).map(([eventId, value]) => {
						const { event, shifts } = value as {
							event: Shift["event"];
							shifts: Shift[];
						};
						return (
							<div key={eventId} className="space-y-6">
								{event && (
									<h2 className="text-2xl font-semibold text-foreground">{event.title}</h2>
								)}
								<StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
									{shifts.map((shift) => {
									const shiftSignups = signupsByShift[shift.id] || [];
									const count = shiftSignups.length;
									const currentUserSignupId = session?.user.id
										? shiftSignups.find(
												(s: Signup) => s.user_id === session.user.id
											)?.id
										: undefined;

									return (
										<ShiftCardWithDelete
											key={shift.id}
											shift={shift}
											count={count}
											currentUserSignupId={currentUserSignupId}
											canDelete={canEdit}
											canEdit={canEdit}
										/>
									);
								})}
								</StaggerContainer>
							</div>
						);
					})}
				</div>
			) : (
				<p className="text-muted-foreground text-lg">Geen shifts gevonden</p>
			)}
		</PageTransition>
	);
}


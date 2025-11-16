import { createSupabaseServer } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { Event, Role } from "@/lib/types";
import { EventEditorClient } from "@/components/editors/EventEditorClient";
import { EventCard } from "@/components/EventCard";
import { PageTransition } from "@/components/PageTransition";
import { StaggerContainer } from "@/components/StaggerContainer";

export default async function EventsPage() {
	const supabase = createSupabaseServer();
	const { profile } = await getSession();
	const canEdit = profile?.role === Role.Admin || profile?.role === Role.Kernlid;
	const { data: events, error } = await supabase
		.from("events")
		.select("*")
		.order("date", { ascending: true });

	if (error) {
		console.error("Error loading events:", error);
		return (
			<div className="container mx-auto p-6">
				<h1 className="text-3xl font-bold mb-6">Events</h1>
				<div className="text-red-600">
					<p className="font-semibold">Fout bij laden van events</p>
					{process.env.NODE_ENV === "development" && (
						<p className="text-sm mt-2 text-muted-foreground">
							{error.message || JSON.stringify(error)}
						</p>
					)}
				</div>
			</div>
		);
	}

	return (
		<PageTransition>
			<div className="flex items-center justify-between mb-8">
				<h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
					Events
				</h1>
				{canEdit && <EventEditorClient />}
			</div>
			{events && events.length > 0 ? (
				<StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{events.map((event: Event, index: number) => (
						<EventCard key={event.id} event={event} canEdit={canEdit} />
					))}
				</StaggerContainer>
			) : (
				<p className="text-muted-foreground text-lg">Geen events gevonden</p>
			)}
		</PageTransition>
	);
}


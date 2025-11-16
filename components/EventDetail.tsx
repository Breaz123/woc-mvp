import { Event, Shift, Signup, Role } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { nl } from "date-fns/locale/nl";
import { ShiftCardWithDelete } from "./ShiftCardWithDelete";
import { EventEditorClient } from "@/components/editors/EventEditorClient";
import { ShiftEditorClient } from "@/components/editors/ShiftEditorClient";
import Image from "next/image";

interface EventDetailProps {
	event: Event;
	shifts?: Shift[];
	signupsByShift?: Record<string, Signup[]>;
	currentUserId?: string;
	canEdit?: boolean;
}

export function EventDetail({
	event,
	shifts = [],
	signupsByShift = {},
	currentUserId,
	canEdit = false,
}: EventDetailProps) {
	const eventDate = new Date(event.date);

	return (
		<div className="space-y-6">
			<Card>
				{event.image_url && (
					<div className="relative w-full h-64 md:h-96">
						<Image
							src={event.image_url}
							alt={event.title}
							fill
							className="object-cover rounded-t-lg"
						/>
					</div>
				)}
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle className="text-3xl">{event.title}</CardTitle>
						{canEdit && <EventEditorClient event={event} />}
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					{event.description && (
						<p className="text-muted-foreground">{event.description}</p>
					)}
					<div className="space-y-2">
						<p className="text-sm">
							<span className="font-medium">Datum:</span>{" "}
							{format(eventDate, "d MMMM yyyy", { locale: nl })}
						</p>
						{event.location && (
							<p className="text-sm">
								<span className="font-medium">Locatie:</span> {event.location}
							</p>
						)}
					</div>
				</CardContent>
			</Card>
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-2xl font-semibold">Shifts</h2>
					{canEdit && <ShiftEditorClient eventId={event.id} />}
				</div>
				{shifts.length > 0 ? (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{shifts.map((shift) => {
							const shiftSignups = signupsByShift[shift.id] || [];
							const count = shiftSignups.length;
							const currentUserSignupId = currentUserId
								? shiftSignups.find(
										(s: Signup) => s.user_id === currentUserId
									)?.id
								: undefined;

							return (
								<div key={shift.id} className="space-y-2">
									<ShiftCardWithDelete
										shift={{ ...shift, event }}
										count={count}
										currentUserSignupId={currentUserSignupId}
										canDelete={canEdit}
										canEdit={canEdit}
									/>
									{canEdit && (
										<div className="flex justify-end">
											<ShiftEditorClient shift={shift} eventId={event.id} />
										</div>
									)}
								</div>
							);
						})}
					</div>
				) : (
					<p className="text-muted-foreground">Nog geen shifts voor dit event</p>
				)}
			</div>
		</div>
	);
}

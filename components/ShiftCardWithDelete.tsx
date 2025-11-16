"use client";

import { ShiftCard } from "./ShiftCard";
import { Shift, Signup } from "@/lib/types";
import { useShiftDelete } from "./ShiftDeleteAction";
import { ShiftEditButton } from "./editors/ShiftEditButton";

interface ShiftCardWithDeleteProps {
	shift: Shift;
	count: number;
	currentUserSignupId?: string;
	canDelete?: boolean;
	canEdit?: boolean;
}

export function ShiftCardWithDelete({
	shift,
	count,
	currentUserSignupId,
	canDelete = false,
	canEdit = false,
}: ShiftCardWithDeleteProps) {
	const handleDelete = useShiftDelete();

	// Get eventId from shift
	const eventId = shift.event_id || (shift.event?.id as string);

	return (
		<div className="relative">
			<ShiftCard
				shift={shift}
				count={count}
				currentUserSignupId={currentUserSignupId}
				showDelete={canDelete}
				onDelete={() => handleDelete(shift.id)}
				showEdit={canEdit && !!eventId}
				editButton={
					canEdit && eventId ? (
						<ShiftEditButton shift={shift} eventId={eventId} />
					) : undefined
				}
				allowUnsignup={false}
			/>
		</div>
	);
}


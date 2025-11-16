"use client";

import { useState } from "react";
import { Shift } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ShiftEditor } from "./ShiftEditor";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";

interface ShiftEditButtonProps {
	shift: Shift;
	eventId: string;
}

export function ShiftEditButton({ shift, eventId }: ShiftEditButtonProps) {
	const [isOpen, setIsOpen] = useState(false);
	const router = useRouter();

	const handleSave = async (data: {
		title: string;
		description?: string;
		start_time: string;
		end_time: string;
		max_slots: number;
	}) => {
		try {
			const response = await fetch("/api/shifts", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					id: shift.id,
					event_id: eventId,
					...data,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Fout bij opslaan");
			}

			toast.success("Shift bijgewerkt");
			setIsOpen(false);
			router.refresh();
		} catch (error: any) {
			toast.error(error.message || "Fout bij opslaan");
			throw error;
		}
	};

	return (
		<>
			<Button
				variant="ghost"
				size="icon"
				onClick={(e) => {
					e.preventDefault();
					e.stopPropagation();
					setIsOpen(true);
				}}
				className="h-8 w-8"
				title="Bewerken"
			>
				<Pencil className="h-4 w-4" />
			</Button>
			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Shift bewerken</DialogTitle>
					</DialogHeader>
					<ShiftEditor
						shift={shift}
						eventId={eventId}
						onSave={handleSave}
						onCancel={() => setIsOpen(false)}
					/>
				</DialogContent>
			</Dialog>
		</>
	);
}


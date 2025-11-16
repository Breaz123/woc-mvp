"use client";

import { useState } from "react";
import { ShiftEditor } from "./ShiftEditor";
import { Shift } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ShiftEditorClientProps {
	shift?: Shift;
	eventId: string;
}

export function ShiftEditorClient({
	shift,
	eventId,
}: ShiftEditorClientProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
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
					id: shift?.id,
					event_id: eventId,
					...data,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Fout bij opslaan");
			}

			toast.success(shift ? "Shift bijgewerkt" : "Shift toegevoegd");
			setIsOpen(false);
			router.refresh();
		} catch (error: any) {
			toast.error(error.message || "Fout bij opslaan");
			throw error;
		}
	};

	const handleDelete = async () => {
		if (!shift) return;
		if (!confirm("Weet je zeker dat je deze shift wilt verwijderen?")) {
			return;
		}

		setIsDeleting(true);
		try {
			const response = await fetch(`/api/shifts?id=${shift.id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Fout bij verwijderen");
			}

			toast.success("Shift verwijderd");
			router.refresh();
		} catch (error: any) {
			toast.error(error.message || "Fout bij verwijderen");
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<div className="space-y-2">
			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogTrigger asChild>
					<Button variant="outline" size="sm">
						{shift ? "Bewerken" : "Nieuwe shift toevoegen"}
					</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{shift ? "Shift bewerken" : "Nieuwe shift toevoegen"}
						</DialogTitle>
					</DialogHeader>
					<ShiftEditor
						shift={shift}
						eventId={eventId}
						onSave={handleSave}
						onCancel={() => setIsOpen(false)}
					/>
				</DialogContent>
			</Dialog>
			{shift && (
				<Button
					variant="destructive"
					size="sm"
					onClick={handleDelete}
					disabled={isDeleting}
				>
					{isDeleting ? "Verwijderen..." : "Verwijderen"}
				</Button>
			)}
		</div>
	);
}


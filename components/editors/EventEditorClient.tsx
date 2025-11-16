"use client";

import { useState } from "react";
import { EventEditor } from "./EventEditor";
import { Event } from "@/lib/types";
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

interface EventEditorClientProps {
	event?: Event;
}

export function EventEditorClient({ event }: EventEditorClientProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const router = useRouter();

	const handleSave = async (data: {
		title: string;
		description?: string;
		date: string;
		location?: string;
		image_url?: string;
	}) => {
		try {
			const response = await fetch("/api/events", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					id: event?.id,
					...data,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Fout bij opslaan");
			}

			toast.success(event ? "Event bijgewerkt" : "Event toegevoegd");
			setIsOpen(false);
			router.refresh();
		} catch (error: any) {
			toast.error(error.message || "Fout bij opslaan");
			throw error;
		}
	};

	const handleDelete = async () => {
		if (!event) return;
		if (!confirm("Weet je zeker dat je dit event wilt verwijderen?")) {
			return;
		}

		setIsDeleting(true);
		try {
			const response = await fetch(`/api/events?id=${event.id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Fout bij verwijderen");
			}

			toast.success("Event verwijderd");
			router.push("/events");
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
						{event ? "Bewerken" : "Nieuw event toevoegen"}
					</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{event ? "Event bewerken" : "Nieuw event toevoegen"}
						</DialogTitle>
					</DialogHeader>
					<EventEditor
						event={event}
						onSave={handleSave}
						onCancel={() => setIsOpen(false)}
					/>
				</DialogContent>
			</Dialog>
			{event && (
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


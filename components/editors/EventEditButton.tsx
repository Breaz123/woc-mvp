"use client";

import { useState } from "react";
import { Event } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { EventEditor } from "./EventEditor";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";

interface EventEditButtonProps {
	event: Event;
}

export function EventEditButton({ event }: EventEditButtonProps) {
	const [isOpen, setIsOpen] = useState(false);
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
					id: event.id,
					...data,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Fout bij opslaan");
			}

			toast.success("Event bijgewerkt");
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
						<DialogTitle>Event bewerken</DialogTitle>
					</DialogHeader>
					<EventEditor
						event={event}
						onSave={handleSave}
						onCancel={() => setIsOpen(false)}
					/>
				</DialogContent>
			</Dialog>
		</>
	);
}


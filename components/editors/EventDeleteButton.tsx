"use client";

import { useState } from "react";
import { Event } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

interface EventDeleteButtonProps {
	event: Event;
}

export function EventDeleteButton({ event }: EventDeleteButtonProps) {
	const [isDeleting, setIsDeleting] = useState(false);
	const router = useRouter();

	const handleDelete = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

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
			router.refresh();
		} catch (error: any) {
			toast.error(error.message || "Fout bij verwijderen");
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={handleDelete}
			disabled={isDeleting}
			className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
			title="Verwijderen"
		>
			<Trash2 className="h-4 w-4" />
		</Button>
	);
}


"use client";

import { useState } from "react";
import { Shift } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

interface ShiftDeleteButtonProps {
	shift: Shift;
}

export function ShiftDeleteButton({ shift }: ShiftDeleteButtonProps) {
	const [isDeleting, setIsDeleting] = useState(false);
	const router = useRouter();

	const handleDelete = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

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


"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function useShiftDelete() {
	const router = useRouter();

	return async (shiftId: string) => {
		if (!confirm("Weet je zeker dat je deze shift wilt verwijderen?")) {
			return;
		}

		try {
			const response = await fetch(`/api/shifts?id=${shiftId}`, {
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
		}
	};
}


"use client";

import { useState } from "react";
import { SponsorEditor } from "./SponsorEditor";
import { Sponsor } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface SponsorEditorClientProps {
	sponsor?: Sponsor;
}

export function SponsorEditorClient({ sponsor }: SponsorEditorClientProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const router = useRouter();

	const handleSave = async (data: {
		name: string;
		logo_url?: string;
		website_url?: string;
		description?: string;
	}) => {
		try {
			const response = await fetch("/api/sponsors", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					id: sponsor?.id,
					...data,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Fout bij opslaan");
			}

			toast.success(sponsor ? "Sponsor bijgewerkt" : "Sponsor toegevoegd");
			setIsOpen(false);
			router.refresh();
		} catch (error: any) {
			toast.error(error.message || "Fout bij opslaan");
			throw error;
		}
	};

	const handleDelete = async () => {
		if (!sponsor) return;
		if (!confirm("Weet je zeker dat je deze sponsor wilt verwijderen?")) {
			return;
		}

		setIsDeleting(true);
		try {
			const response = await fetch(`/api/sponsors?id=${sponsor.id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Fout bij verwijderen");
			}

			toast.success("Sponsor verwijderd");
			router.refresh();
		} catch (error: any) {
			toast.error(error.message || "Fout bij verwijderen");
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<div className="flex gap-2">
			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogTrigger asChild>
					<Button variant="outline" size="sm">
						{sponsor ? "Bewerken" : "Nieuwe sponsor toevoegen"}
					</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{sponsor ? "Sponsor bewerken" : "Nieuwe sponsor toevoegen"}
						</DialogTitle>
					</DialogHeader>
					<SponsorEditor
						sponsor={sponsor}
						onSave={handleSave}
						onCancel={() => setIsOpen(false)}
					/>
				</DialogContent>
			</Dialog>
			{sponsor && (
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


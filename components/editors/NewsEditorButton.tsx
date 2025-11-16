"use client";

import { useState } from "react";
import { NewsEditor } from "./NewsEditor";
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

export function NewsEditorButton() {
	const [isOpen, setIsOpen] = useState(false);
	const router = useRouter();

	const handleSave = async (data: { title: string; content: string; image_url?: string }) => {
		try {
			const response = await fetch("/api/news", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					title: data.title,
					content: data.content,
					image_url: data.image_url,
				}),
			});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			const errorMessage = typeof errorData.error === 'string' 
				? errorData.error 
				: Array.isArray(errorData.error)
				? errorData.error.map((e: any) => e.message || JSON.stringify(e)).join(", ")
				: errorData.error?.message || "Fout bij opslaan";
			throw new Error(errorMessage);
		}

			toast.success("Nieuwsartikel toegevoegd");
			setIsOpen(false);
			router.refresh();
		} catch (error: any) {
			toast.error(error.message || "Fout bij opslaan");
			throw error;
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm">
					Nieuw nieuws toevoegen
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Nieuw nieuwsartikel toevoegen</DialogTitle>
				</DialogHeader>
				<NewsEditor onSave={handleSave} onCancel={() => setIsOpen(false)} />
			</DialogContent>
		</Dialog>
	);
}


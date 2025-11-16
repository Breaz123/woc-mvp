"use client";

import { useState } from "react";
import { NewsEditor } from "./NewsEditor";
import { News } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface NewsEditorClientProps {
	news: News;
}

export function NewsEditorClient({ news }: NewsEditorClientProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const router = useRouter();

	const handleSave = async (data: { title: string; content: string; image_url?: string }) => {
		try {
			const response = await fetch("/api/news", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					id: news.id,
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

			toast.success("Nieuwsartikel bijgewerkt");
			setIsOpen(false);
			router.refresh();
		} catch (error: any) {
			toast.error(error.message || "Fout bij opslaan");
			throw error;
		}
	};

	const handleDelete = async () => {
		if (!confirm("Weet je zeker dat je dit nieuwsartikel wilt verwijderen?")) {
			return;
		}

		setIsDeleting(true);
		try {
			const response = await fetch(`/api/news?id=${news.id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Fout bij verwijderen");
			}

			toast.success("Nieuwsartikel verwijderd");
			router.push("/news");
		} catch (error: any) {
			toast.error(error.message || "Fout bij verwijderen");
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex gap-2">
				<Dialog open={isOpen} onOpenChange={setIsOpen}>
					<DialogTrigger asChild>
						<Button variant="outline">Bewerken</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Nieuwsartikel bewerken</DialogTitle>
						</DialogHeader>
						<NewsEditor news={news} onSave={handleSave} onCancel={() => setIsOpen(false)} />
					</DialogContent>
				</Dialog>
				<Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
					{isDeleting ? "Verwijderen..." : "Verwijderen"}
				</Button>
			</div>
		</div>
	);
}


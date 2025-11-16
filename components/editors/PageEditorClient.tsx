"use client";

import { useState } from "react";
import { PageEditor } from "./PageEditor";
import { Page } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface PageEditorClientProps {
	page: Page;
}

export function PageEditorClient({ page }: PageEditorClientProps) {
	const [isOpen, setIsOpen] = useState(false);
	const router = useRouter();

	const handleSave = async (data: { title: string; content: string }) => {
		try {
			const response = await fetch("/api/pages", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					slug: page.slug,
					title: data.title,
					content: data.content,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Fout bij opslaan");
			}

			toast.success("Pagina bijgewerkt");
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
					Bewerken
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Pagina bewerken</DialogTitle>
				</DialogHeader>
				<PageEditor page={page} onSave={handleSave} onCancel={() => setIsOpen(false)} />
			</DialogContent>
		</Dialog>
	);
}


"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Page } from "@/lib/types";
import { toast } from "sonner";

interface PageEditorProps {
	page?: Page;
	onSave: (data: { title: string; content: string }) => Promise<void>;
	onCancel?: () => void;
}

export function PageEditor({ page, onSave, onCancel }: PageEditorProps) {
	const [title, setTitle] = useState(page?.title || "");
	const [content, setContent] = useState(page?.content || "");
	const [isSaving, setIsSaving] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim() || !content.trim()) {
			toast.error("Titel en inhoud zijn verplicht");
			return;
		}

		setIsSaving(true);
		try {
			await onSave({ title: title.trim(), content: content.trim() });
			toast.success("Pagina opgeslagen");
		} catch (error) {
			toast.error("Fout bij opslaan");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div>
				<label htmlFor="title" className="block text-sm font-medium mb-2">
					Titel
				</label>
				<Input
					id="title"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					required
				/>
			</div>
			<div>
				<label htmlFor="content" className="block text-sm font-medium mb-2">
					Inhoud
				</label>
				<Textarea
					id="content"
					value={content}
					onChange={(e) => setContent(e.target.value)}
					rows={15}
					required
				/>
			</div>
			<div className="flex gap-2">
				<Button type="submit" disabled={isSaving}>
					{isSaving ? "Opslaan..." : "Opslaan"}
				</Button>
				{onCancel && (
					<Button type="button" variant="outline" onClick={onCancel}>
						Annuleren
					</Button>
				)}
			</div>
		</form>
	);
}


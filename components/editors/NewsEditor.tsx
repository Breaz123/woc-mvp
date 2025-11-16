"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { News } from "@/lib/types";
import { toast } from "sonner";
import Image from "next/image";

interface NewsEditorProps {
	news?: News;
	onSave: (data: { title: string; content: string; image_url?: string }) => Promise<void>;
	onCancel?: () => void;
}

export function NewsEditor({ news, onSave, onCancel }: NewsEditorProps) {
	const [title, setTitle] = useState(news?.title || "");
	const [content, setContent] = useState(news?.content || "");
	const [imageUrl, setImageUrl] = useState(news?.image_url || "");
	const [isSaving, setIsSaving] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Validate file type
		const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
		if (!validTypes.includes(file.type)) {
			toast.error("Alleen JPEG, PNG en WebP afbeeldingen zijn toegestaan");
			return;
		}

		// Validate file size (max 5MB)
		const maxSize = 5 * 1024 * 1024;
		if (file.size > maxSize) {
			toast.error("Bestand is te groot. Maximum 5MB toegestaan");
			return;
		}

		setImageFile(file);
		setImageUrl(""); // Clear URL when file is selected
		
		// Create preview
		const reader = new FileReader();
		reader.onloadend = () => {
			setImagePreview(reader.result as string);
		};
		reader.readAsDataURL(file);
	};

	const handleUploadImage = async () => {
		if (!imageFile) return;

		setIsUploading(true);
		try {
			const formData = new FormData();
			formData.append("file", imageFile);
			formData.append("type", "news");

			const response = await fetch("/api/upload", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Fout bij uploaden");
			}

			const { url } = await response.json();
			setImageUrl(url);
			setImageFile(null);
			setImagePreview(null);
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
			toast.success("Afbeelding geüpload");
		} catch (error: any) {
			toast.error(error.message || "Fout bij uploaden van afbeelding");
		} finally {
			setIsUploading(false);
		}
	};

	const handleRemoveImage = () => {
		setImageFile(null);
		setImagePreview(null);
		setImageUrl("");
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim() || !content.trim()) {
			toast.error("Titel en inhoud zijn verplicht");
			return;
		}

		setIsSaving(true);
		try {
			// If there's a file selected but not uploaded yet, upload it first
			let finalImageUrl = imageUrl;
			if (imageFile && !imageUrl) {
				const formData = new FormData();
				formData.append("file", imageFile);
				formData.append("type", "news");

				const uploadResponse = await fetch("/api/upload", {
					method: "POST",
					body: formData,
				});

				if (!uploadResponse.ok) {
					const errorData = await uploadResponse.json();
					throw new Error(errorData.error || "Fout bij uploaden van afbeelding");
				}

				const { url } = await uploadResponse.json();
				finalImageUrl = url;
			}

			await onSave({ 
				title: title.trim(), 
				content: content.trim(),
				image_url: finalImageUrl.trim() || undefined,
			});
			toast.success("Nieuwsartikel opgeslagen");
		} catch (error: any) {
			toast.error(error.message || "Fout bij opslaan");
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
					rows={10}
					required
				/>
			</div>
			<div>
				<label className="block text-sm font-medium mb-2">
					Afbeelding (optioneel)
				</label>
				<div className="space-y-2">
					{(imagePreview || imageUrl) && (
						<div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden border">
							<Image
								src={imagePreview || imageUrl}
								alt="Preview"
								fill
								className="object-cover"
							/>
						</div>
					)}
					<div className="flex gap-2">
						<Input
							ref={fileInputRef}
							type="file"
							accept="image/jpeg,image/jpg,image/png,image/webp"
							onChange={handleFileSelect}
							className="flex-1"
						/>
						{imageFile && !imageUrl && (
							<Button
								type="button"
								variant="outline"
								onClick={handleUploadImage}
								disabled={isUploading}
							>
								{isUploading ? "Uploaden..." : "Uploaden"}
							</Button>
						)}
						{(imagePreview || imageUrl) && (
							<Button
								type="button"
								variant="outline"
								onClick={handleRemoveImage}
							>
								Verwijderen
							</Button>
						)}
					</div>
				</div>
			</div>
			<div className="flex gap-2">
				<Button type="submit" disabled={isSaving || isUploading}>
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


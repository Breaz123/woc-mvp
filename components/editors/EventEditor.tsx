"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Event } from "@/lib/types";
import { toast } from "sonner";
import Image from "next/image";

interface EventEditorProps {
	event?: Event;
	onSave: (data: {
		title: string;
		description?: string;
		date: string;
		location?: string;
		image_url?: string;
	}) => Promise<void>;
	onCancel?: () => void;
}

export function EventEditor({ event, onSave, onCancel }: EventEditorProps) {
	const [title, setTitle] = useState(event?.title || "");
	const [description, setDescription] = useState(event?.description || "");
	const [date, setDate] = useState(
		event?.date ? new Date(event.date).toISOString().slice(0, 16) : ""
	);
	const [location, setLocation] = useState(event?.location || "");
	const [imageUrl, setImageUrl] = useState(event?.image_url || "");
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(
		event?.image_url || null
	);
	const [isUploading, setIsUploading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
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
		const maxSize = 5 * 1024 * 1024; // 5MB
		if (file.size > maxSize) {
			toast.error("Bestand is te groot. Maximum 5MB toegestaan");
			return;
		}

		setSelectedFile(file);
		const reader = new FileReader();
		reader.onloadend = () => {
			setPreviewUrl(reader.result as string);
		};
		reader.readAsDataURL(file);
	};

	const handleUpload = async () => {
		if (!selectedFile) return;

		setIsUploading(true);
		try {
			const formData = new FormData();
			formData.append("file", selectedFile);

			const response = await fetch("/api/upload", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Fout bij uploaden");
			}

			const data = await response.json();
			setImageUrl(data.url);
			setSelectedFile(null);
			toast.success("Afbeelding geüpload");
		} catch (error: any) {
			toast.error(error.message || "Fout bij uploaden van afbeelding");
		} finally {
			setIsUploading(false);
		}
	};

	const handleRemoveImage = () => {
		setImageUrl("");
		setPreviewUrl(null);
		setSelectedFile(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim()) {
			toast.error("Titel is verplicht");
			return;
		}
		if (!date) {
			toast.error("Datum is verplicht");
			return;
		}

		// If a file is selected but not uploaded yet, upload it first
		if (selectedFile && !imageUrl) {
			await handleUpload();
			// Wait a bit for the upload to complete
			await new Promise((resolve) => setTimeout(resolve, 500));
		}

		setIsSaving(true);
		try {
			// Convert local datetime to ISO string
			const dateISO = new Date(date).toISOString();
			await onSave({
				title: title.trim(),
				description: description.trim() || undefined,
				date: dateISO,
				location: location.trim() || undefined,
				image_url: imageUrl || undefined,
			});
		} catch (error) {
			// Error is already handled in parent
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div>
				<label htmlFor="title" className="block text-sm font-medium mb-2">
					Titel *
				</label>
				<Input
					id="title"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					required
				/>
			</div>
			<div>
				<label htmlFor="date" className="block text-sm font-medium mb-2">
					Datum en tijd *
				</label>
				<Input
					id="date"
					type="datetime-local"
					value={date}
					onChange={(e) => setDate(e.target.value)}
					required
				/>
			</div>
			<div>
				<label htmlFor="location" className="block text-sm font-medium mb-2">
					Locatie
				</label>
				<Input
					id="location"
					value={location}
					onChange={(e) => setLocation(e.target.value)}
				/>
			</div>
			<div>
				<label
					htmlFor="description"
					className="block text-sm font-medium mb-2"
				>
					Beschrijving
				</label>
				<Textarea
					id="description"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					rows={6}
				/>
			</div>
			<div>
				<label htmlFor="image" className="block text-sm font-medium mb-2">
					Afbeelding
				</label>
				{previewUrl && (
					<div className="mb-4 relative">
						<Image
							src={previewUrl}
							alt="Preview"
							width={400}
							height={300}
							className="object-cover rounded-lg border"
						/>
						<Button
							type="button"
							variant="destructive"
							size="sm"
							onClick={handleRemoveImage}
							className="absolute top-2 right-2"
						>
							Verwijderen
						</Button>
					</div>
				)}
				<div className="flex gap-2">
					<Input
						id="image"
						type="file"
						accept="image/jpeg,image/jpg,image/png,image/webp"
						onChange={handleFileSelect}
						ref={fileInputRef}
						className="flex-1"
					/>
					{selectedFile && !imageUrl && (
						<Button
							type="button"
							variant="outline"
							onClick={handleUpload}
							disabled={isUploading}
						>
							{isUploading ? "Uploaden..." : "Upload"}
						</Button>
					)}
				</div>
				<p className="text-xs text-muted-foreground mt-1">
					Maximaal 5MB. JPEG, PNG of WebP.
				</p>
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


"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sponsor } from "@/lib/types";
import { toast } from "sonner";

interface SponsorEditorProps {
	sponsor?: Sponsor;
	onSave: (data: {
		name: string;
		logo_url?: string;
		website_url?: string;
		description?: string;
	}) => Promise<void>;
	onCancel?: () => void;
}

export function SponsorEditor({
	sponsor,
	onSave,
	onCancel,
}: SponsorEditorProps) {
	const [name, setName] = useState(sponsor?.name || "");
	const [logoUrl, setLogoUrl] = useState(sponsor?.logo_url || "");
	const [websiteUrl, setWebsiteUrl] = useState(sponsor?.website_url || "");
	const [description, setDescription] = useState(sponsor?.description || "");
	const [isSaving, setIsSaving] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [logoFile, setLogoFile] = useState<File | null>(null);
	const [logoPreview, setLogoPreview] = useState<string | null>(null);
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

		setLogoFile(file);
		setLogoUrl(""); // Clear URL when file is selected
		
		// Create preview
		const reader = new FileReader();
		reader.onloadend = () => {
			setLogoPreview(reader.result as string);
		};
		reader.readAsDataURL(file);
	};

	const handleUploadLogo = async () => {
		if (!logoFile) return;

		setIsUploading(true);
		try {
			const formData = new FormData();
			formData.append("file", logoFile);
			formData.append("type", "sponsor");

			const response = await fetch("/api/upload", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Fout bij uploaden");
			}

			const { url } = await response.json();
			setLogoUrl(url);
			setLogoFile(null);
			setLogoPreview(null);
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
			toast.success("Logo geüpload");
		} catch (error: any) {
			toast.error(error.message || "Fout bij uploaden van logo");
		} finally {
			setIsUploading(false);
		}
	};

	const handleRemoveLogo = () => {
		setLogoFile(null);
		setLogoPreview(null);
		setLogoUrl("");
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) {
			toast.error("Naam is verplicht");
			return;
		}

		setIsSaving(true);
		try {
			// If there's a file selected but not uploaded yet, upload it first
			let finalLogoUrl = logoUrl;
			if (logoFile && !logoUrl) {
				const formData = new FormData();
				formData.append("file", logoFile);
				formData.append("type", "sponsor");

				const uploadResponse = await fetch("/api/upload", {
					method: "POST",
					body: formData,
				});

				if (!uploadResponse.ok) {
					const errorData = await uploadResponse.json();
					throw new Error(errorData.error || "Fout bij uploaden van logo");
				}

				const { url } = await uploadResponse.json();
				finalLogoUrl = url;
			}

			await onSave({
				name: name.trim(),
				logo_url: finalLogoUrl.trim() || undefined,
				website_url: websiteUrl.trim() || undefined,
				description: description.trim() || undefined,
			});
			toast.success("Sponsor opgeslagen");
		} catch (error: any) {
			toast.error(error.message || "Fout bij opslaan");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div>
				<label htmlFor="name" className="block text-sm font-medium mb-2">
					Naam *
				</label>
				<Input
					id="name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					required
				/>
			</div>
			<div>
				<label htmlFor="logo" className="block text-sm font-medium mb-2">
					Logo
				</label>
				<div className="space-y-2">
					{/* File upload */}
					<div className="flex gap-2">
						<Input
							ref={fileInputRef}
							id="logo_file"
							type="file"
							accept="image/jpeg,image/jpg,image/png,image/webp"
							onChange={handleFileSelect}
							className="flex-1"
						/>
						{logoFile && (
							<>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={handleUploadLogo}
									disabled={isUploading}
								>
									{isUploading ? "Uploaden..." : "Uploaden"}
								</Button>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={handleRemoveLogo}
								>
									Verwijderen
								</Button>
							</>
						)}
					</div>
					{/* Preview */}
					{(logoPreview || logoUrl) && (
						<div className="relative inline-block">
							<img
								src={logoPreview || logoUrl}
								alt="Logo preview"
								className="h-20 w-auto border rounded"
							/>
							{logoUrl && !logoFile && (
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={handleRemoveLogo}
									className="absolute top-0 right-0"
								>
									×
								</Button>
							)}
						</div>
					)}
					{/* URL input (alternative to upload) */}
					<div className="text-sm text-gray-500">of</div>
					<Input
						id="logo_url"
						type="text"
						placeholder="Logo URL (bijv. https://example.com/logo.png)"
						value={logoUrl}
						onChange={(e) => {
							setLogoUrl(e.target.value);
							if (e.target.value) {
								setLogoFile(null);
								setLogoPreview(null);
								if (fileInputRef.current) {
									fileInputRef.current.value = "";
								}
							}
						}}
						disabled={!!logoFile}
					/>
				</div>
			</div>
			<div>
				<label htmlFor="website_url" className="block text-sm font-medium mb-2">
					Website URL
				</label>
				<Input
					id="website_url"
					type="text"
					placeholder="bijv. www.example.com of https://example.com"
					value={websiteUrl}
					onChange={(e) => setWebsiteUrl(e.target.value)}
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
					rows={4}
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


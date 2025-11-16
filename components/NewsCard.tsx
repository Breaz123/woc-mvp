"use client";

import { News } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { nl } from "date-fns/locale/nl";
import Link from "next/link";
import Image from "next/image";
import { NewsEditorClient } from "@/components/editors/NewsEditorClient";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { NewsEditor } from "@/components/editors/NewsEditor";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface NewsCardProps {
	news: News;
	canEdit: boolean;
}

export function NewsCard({ news, canEdit }: NewsCardProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const router = useRouter();
	const date = new Date(news.created_at);
	
	// Truncate content to 40 characters
	const truncateContent = (text: string, maxLength: number = 40) => {
		if (text.length <= maxLength) return text;
		return text.substring(0, maxLength).trim() + "... meer lezen";
	};
	const truncatedContent = truncateContent(news.content);

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
			router.refresh();
		} catch (error: any) {
			toast.error(error.message || "Fout bij verwijderen");
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<Card className="flex flex-col hover:shadow-lg transition-shadow overflow-hidden">
			{news.image_url && (
				<div className="relative w-full h-48">
					<Image
						src={news.image_url}
						alt={news.title}
						fill
						className="object-cover"
					/>
				</div>
			)}
			<CardHeader className="flex-1">
				<CardTitle className="line-clamp-2">{news.title}</CardTitle>
				<p className="text-sm text-muted-foreground">
					{format(date, "d MMMM yyyy", { locale: nl })}
					{news.author && ` door ${news.author.name || news.author.email}`}
				</p>
			</CardHeader>
			<CardContent className="flex-1 flex flex-col">
				<p className="text-muted-foreground mb-4 flex-1">
					{truncatedContent}
				</p>
				<div className="flex items-center justify-between gap-2">
					<Link href={`/news/${news.id}`} className="flex-1">
						<Button variant="outline" className="w-full">
							Lees meer
						</Button>
					</Link>
					{canEdit && (
						<>
							<Dialog open={isOpen} onOpenChange={setIsOpen}>
								<DialogTrigger asChild>
									<Button variant="outline" size="icon">
										<Pencil className="h-4 w-4" />
									</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Nieuwsartikel bewerken</DialogTitle>
									</DialogHeader>
									<NewsEditor news={news} onSave={handleSave} onCancel={() => setIsOpen(false)} />
								</DialogContent>
							</Dialog>
							<Button 
								variant="outline" 
								size="icon"
								onClick={handleDelete} 
								disabled={isDeleting}
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</>
					)}
				</div>
			</CardContent>
		</Card>
	);
}


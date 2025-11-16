"use client";

import { useState, useEffect } from "react";
import { NewsComment } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { nl } from "date-fns/locale/nl";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

interface NewsCommentsProps {
	newsId: string;
	userId?: string;
}

export function NewsComments({ newsId, userId }: NewsCommentsProps) {
	const [comments, setComments] = useState<NewsComment[]>([]);
	const [newComment, setNewComment] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		loadComments();
	}, [newsId]);

	const loadComments = async () => {
		try {
			const response = await fetch(`/api/news/comments?news_id=${newsId}`);
			if (response.ok) {
				const data = await response.json();
				setComments(data);
			}
		} catch (error) {
			console.error("Fout bij laden van reacties:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newComment.trim()) {
			toast.error("Reactie mag niet leeg zijn");
			return;
		}

		if (!userId) {
			toast.error("Je moet ingelogd zijn om te reageren");
			return;
		}

		setIsSubmitting(true);
		try {
			const response = await fetch("/api/news/comments", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					content: newComment.trim(),
					news_id: newsId,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Fout bij plaatsen van reactie");
			}

			toast.success("Reactie geplaatst");
			setNewComment("");
			router.refresh();
			loadComments();
		} catch (error: any) {
			toast.error(error.message || "Fout bij plaatsen van reactie");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDelete = async (commentId: string) => {
		if (!confirm("Weet je zeker dat je deze reactie wilt verwijderen?")) {
			return;
		}

		try {
			const response = await fetch(`/api/news/comments?id=${commentId}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Fout bij verwijderen");
			}

			toast.success("Reactie verwijderd");
			router.refresh();
			loadComments();
		} catch (error: any) {
			toast.error(error.message || "Fout bij verwijderen");
		}
	};

	if (isLoading) {
		return <div className="text-muted-foreground">Reacties laden...</div>;
	}

	return (
		<div className="space-y-6">
			<h3 className="text-xl font-semibold">Reacties ({comments.length})</h3>

			{userId && (
				<form onSubmit={handleSubmit} className="space-y-2">
					<Textarea
						value={newComment}
						onChange={(e) => setNewComment(e.target.value)}
						placeholder="Schrijf een reactie..."
						rows={3}
						required
					/>
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? "Plaatsen..." : "Plaats reactie"}
					</Button>
				</form>
			)}

			<div className="space-y-4">
				{comments.length === 0 ? (
					<p className="text-muted-foreground">Nog geen reacties. Wees de eerste!</p>
				) : (
					comments.map((comment) => {
						const date = new Date(comment.created_at);
						const isOwner = userId && comment.user_id === userId;
						return (
							<div key={comment.id} className="border rounded-lg p-4 space-y-2">
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-1">
											<span className="font-medium">
												{comment.user?.name || comment.user?.email || "Anoniem"}
											</span>
											<span className="text-sm text-muted-foreground">
												{format(date, "d MMMM yyyy 'om' HH:mm", { locale: nl })}
											</span>
										</div>
										<p className="text-sm whitespace-pre-wrap">{comment.content}</p>
									</div>
									{isOwner && (
										<Button
											variant="ghost"
											size="icon"
											onClick={() => handleDelete(comment.id)}
											className="h-8 w-8"
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									)}
								</div>
							</div>
						);
					})
				)}
			</div>
		</div>
	);
}


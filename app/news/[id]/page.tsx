import { createSupabaseServer } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { nl } from "date-fns/locale/nl";
import { News, Role } from "@/lib/types";
import { NewsEditorClient } from "@/components/editors/NewsEditorClient";
import { NewsComments } from "@/components/NewsComments";
import Image from "next/image";

export default async function NewsDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const supabase = createSupabaseServer();
	const { session, profile } = await getSession();

	const { data: news, error } = await supabase
		.from("news")
		.select("*, author:users(*)")
		.eq("id", id)
		.single();

	if (error || !news) {
		notFound();
	}

	const date = new Date(news.created_at);
	const canEdit = profile?.role === Role.Admin || profile?.role === Role.Kernlid;

	return (
		<div className="container mx-auto p-6 max-w-4xl">
			<Card>
				{news.image_url && (
					<div className="relative w-full h-64 md:h-96">
						<Image
							src={news.image_url}
							alt={news.title}
							fill
							className="object-cover rounded-t-lg"
						/>
					</div>
				)}
				<CardHeader>
					<CardTitle className="text-3xl">{news.title}</CardTitle>
					<p className="text-sm text-muted-foreground">
						{format(date, "d MMMM yyyy 'om' HH:mm", { locale: nl })}
						{news.author &&
							` door ${news.author.name || news.author.email}`}
					</p>
				</CardHeader>
				<CardContent>
					<div className="prose max-w-none whitespace-pre-wrap">
						{news.content}
					</div>
				</CardContent>
			</Card>
			{canEdit && (
				<div className="mt-6">
					<NewsEditorClient news={news} />
				</div>
			)}
			<div className="mt-8">
				<NewsComments newsId={id} userId={profile?.id} />
			</div>
		</div>
	);
}

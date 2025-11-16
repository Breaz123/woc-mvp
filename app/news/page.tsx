import { createSupabaseServer } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { News, Role } from "@/lib/types";
import { NewsEditorButton } from "@/components/editors/NewsEditorButton";
import { NewsCard } from "@/components/NewsCard";

export default async function NewsPage() {
	const supabase = createSupabaseServer();
	const { profile } = await getSession();
	const canEdit = profile?.role === Role.Admin || profile?.role === Role.Kernlid;
	const { data: news, error } = await supabase
		.from("news")
		.select("*, author:users(*)")
		.order("created_at", { ascending: false });

	if (error) {
		return <div>Fout bij laden van nieuws</div>;
	}

	return (
		<div className="container mx-auto p-6">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-3xl font-bold">Nieuws</h1>
				{canEdit && <NewsEditorButton />}
			</div>
			{news && news.length > 0 ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{news.map((item: News) => (
						<NewsCard key={item.id} news={item} canEdit={canEdit} />
					))}
				</div>
			) : (
				<p>Geen nieuws gevonden</p>
			)}
		</div>
	);
}


import { createSupabaseServer } from "@/lib/supabase/server";
import { Event, News } from "@/lib/types";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { nl } from "date-fns/locale/nl";
import { Calendar, Newspaper } from "lucide-react";
import Image from "next/image";
import { PageTransition } from "@/components/PageTransition";

export default async function Home() {
	const supabase = createSupabaseServer();

	// Get next upcoming event (events where date >= now order asc limit 1)
	const { data: nextEvent } = await supabase
		.from("events")
		.select("*")
		.gte("date", new Date().toISOString())
		.order("date", { ascending: true })
		.limit(1)
		.single();

	// Get latest 3 news items
	const { data: latestNews } = await supabase
		.from("news")
		.select("*, author:users(*)")
		.order("created_at", { ascending: false })
		.limit(3);

	return (
		<PageTransition>
			<div className="mb-8">
				<h1 className="text-4xl font-bold mb-2 text-primary bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
					WOC MVP
				</h1>
				<p className="text-muted-foreground text-lg">
					Welkom bij het Ouderscomité platform
				</p>
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				{nextEvent && (
					<div>
						<div className="flex items-center gap-2 mb-4">
							<Calendar className="w-5 h-5" />
							<h2 className="text-2xl font-semibold">Volgend Event</h2>
						</div>
						<Card className="overflow-hidden">
							{nextEvent.image_url && (
								<div className="relative w-full h-48">
									<Image
										src={nextEvent.image_url}
										alt={nextEvent.title}
										fill
										className="object-cover"
									/>
								</div>
							)}
							<CardHeader>
								<CardTitle>{nextEvent.title}</CardTitle>
							</CardHeader>
							<CardContent>
								{nextEvent.description && (
									<p className="text-muted-foreground mb-4">
										{nextEvent.description}
									</p>
								)}
								<div className="space-y-2 mb-4">
									<p className="text-sm">
										<span className="font-medium">Datum:</span>{" "}
										{format(new Date(nextEvent.date), "d MMMM yyyy", {
											locale: nl,
										})}
									</p>
									{nextEvent.location && (
										<p className="text-sm">
											<span className="font-medium">Locatie:</span>{" "}
											{nextEvent.location}
										</p>
									)}
								</div>
								<Link href={`/events/${nextEvent.id}`}>
									<Button>Meer details</Button>
								</Link>
							</CardContent>
						</Card>
					</div>
				)}

				<div>
					<div className="flex items-center gap-2 mb-4">
						<Newspaper className="w-5 h-5" />
						<h2 className="text-2xl font-semibold">Laatste Nieuws</h2>
					</div>
					{latestNews && latestNews.length > 0 ? (
						<div className="space-y-4">
							{latestNews.map((item: News) => {
								const date = new Date(item.created_at);
								return (
									<Link key={item.id} href={`/news/${item.id}`}>
										<Card className="hover:shadow-lg transition-shadow">
											<CardHeader>
												<CardTitle className="text-lg">{item.title}</CardTitle>
												<p className="text-xs text-muted-foreground">
													{format(date, "d MMMM yyyy", { locale: nl })}
												</p>
											</CardHeader>
											<CardContent>
												<p className="text-sm text-muted-foreground line-clamp-2">
													{item.content}
												</p>
											</CardContent>
										</Card>
									</Link>
								);
							})}
							<Link href="/news">
								<Button variant="outline" className="w-full">
									Alle nieuws
								</Button>
							</Link>
						</div>
					) : (
						<p className="text-muted-foreground">Geen nieuws beschikbaar</p>
					)}
				</div>
			</div>
		</PageTransition>
	);
}


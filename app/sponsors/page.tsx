import { createSupabaseServer } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { Sponsor, Role } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { SponsorEditorClient } from "@/components/editors/SponsorEditorClient";
import { SponsorLogo } from "@/components/SponsorLogo";

export default async function SponsorsPage() {
	const supabase = createSupabaseServer();
	const { session, profile } = await getSession();
	const { data: sponsors, error } = await supabase
		.from("sponsors")
		.select("*")
		.order("name", { ascending: true });

	if (error) {
		return <div>Fout bij laden van sponsors</div>;
	}

	const isAdmin = profile?.role === Role.Admin;

	return (
		<div className="container mx-auto p-6">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-3xl font-bold">Sponsors</h1>
				{isAdmin && <SponsorEditorClient />}
			</div>
			{sponsors && sponsors.length > 0 ? (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{sponsors.map((sponsor: Sponsor) => (
						<Card key={sponsor.id}>
							<CardHeader>
								{sponsor.logo_url && (
									<SponsorLogo
										logoUrl={sponsor.logo_url}
										name={sponsor.name}
										websiteUrl={sponsor.website_url}
									/>
								)}
								<CardTitle>{sponsor.name}</CardTitle>
							</CardHeader>
							{sponsor.description && (
								<CardContent>
									<p className="text-muted-foreground">{sponsor.description}</p>
								</CardContent>
							)}
							{sponsor.website_url && (
								<CardContent className="pt-0">
									<Link
										href={sponsor.website_url}
										target="_blank"
										rel="noopener noreferrer"
										className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1"
									>
										Bezoek website
										<svg
											className="w-4 h-4"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
											/>
										</svg>
									</Link>
								</CardContent>
							)}
							{isAdmin && (
								<CardContent className="pt-0">
									<SponsorEditorClient sponsor={sponsor} />
								</CardContent>
							)}
						</Card>
					))}
				</div>
			) : (
				<p>Geen sponsors gevonden</p>
			)}
		</div>
	);
}

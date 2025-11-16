import { createSupabaseServer } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Role } from "@/lib/types";
import { PageEditorClient } from "@/components/editors/PageEditorClient";
import { ContactButtons } from "@/components/ContactButtons";

export default async function ContactPage() {
	const supabase = createSupabaseServer();
	const { session, profile } = await getSession();
	const { data: page, error } = await supabase
		.from("pages")
		.select("*")
		.eq("slug", "contact")
		.single();

	if (error || !page) {
		notFound();
	}

	const isAdmin = profile?.role === Role.Admin;

	return (
		<div className="container mx-auto p-6 max-w-4xl">
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle className="text-3xl">{page.title}</CardTitle>
						{isAdmin && <PageEditorClient page={page} />}
					</div>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="prose max-w-none whitespace-pre-wrap">{page.content}</div>
					<ContactButtons />
				</CardContent>
			</Card>
		</div>
	);
}

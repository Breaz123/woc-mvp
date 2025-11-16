import { requireRole, getSession } from "@/lib/auth/session";
import { Role } from "@/lib/types";
import { createSupabaseServer } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { PasswordVaultEditorClient } from "@/components/editors/PasswordVaultEditorClient";
import { PasswordVault } from "@/lib/types";
import { Lock } from "lucide-react";
import { PasswordVaultCard } from "@/components/PasswordVaultCard";

export default async function PasswordVaultPage() {
	const { profile } = await getSession();
	const isAdmin = profile?.role === Role.Admin;
	
	// Allow Admin and Kernleden to view
	await requireRole([Role.Admin, Role.Kernlid]);
	const supabase = createSupabaseServer();
	
	// RLS will handle visibility filtering - load entries with user permissions
	const { data: entries, error } = await supabase
		.from("password_vault")
		.select("*, password_vault_users(user_id)")
		.order("platform", { ascending: true });

	// Transform data to include allowed_users array
	const transformedEntries = (entries || []).map((entry: any) => ({
		...entry,
		allowed_users: entry.password_vault_users?.map((pu: any) => ({ user_id: pu.user_id })) || [],
	}));

	if (error) {
		console.error("Error loading password vault:", error);
		return (
			<div className="container mx-auto p-6 max-w-6xl">
				<div className="mb-6">
					<h1 className="text-3xl font-bold flex items-center gap-2">
						<Lock className="h-8 w-8" />
						Password Vault
					</h1>
				</div>
				<Card>
					<CardContent className="pt-6">
						<div className="text-red-600">
							<p className="font-semibold mb-2">Fout bij laden van password vault</p>
							{process.env.NODE_ENV === "development" && (
								<div className="text-sm text-muted-foreground mt-2">
									<p className="font-mono text-xs bg-muted p-2 rounded mt-2">
										{error.message || JSON.stringify(error)}
									</p>
									<p className="mt-2 text-xs">
										Controleer of de tabel "password_vault" bestaat. Voer de SQL script uit uit
										.sql/schema.sql om de tabel aan te maken.
									</p>
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6 max-w-6xl">
			<div className="flex items-center justify-between mb-6">
				<div>
					<h1 className="text-3xl font-bold flex items-center gap-2">
						<Lock className="h-8 w-8" />
						Password Vault
					</h1>
					<p className="text-muted-foreground mt-2">
						Beheer wachtwoorden en login codes voor verschillende platformen
					</p>
				</div>
				{isAdmin && <PasswordVaultEditorClient />}
			</div>

			{transformedEntries && transformedEntries.length > 0 ? (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{transformedEntries.map((entry: PasswordVault) => (
						<PasswordVaultCard key={entry.id} entry={entry} />
					))}
				</div>
			) : (
				<Card>
					<CardContent className="pt-6 text-center text-muted-foreground">
						<p>Nog geen entries. Voeg de eerste entry toe om te beginnen.</p>
					</CardContent>
				</Card>
			)}
		</div>
	);
}


import { requireRole } from "@/lib/auth/session";
import { Role } from "@/lib/types";
import { createSupabaseServer } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserManagementClient } from "@/components/admin/UserManagementClient";

export default async function AdminPage() {
	await requireRole([Role.Admin]);
	const supabase = createSupabaseServer();

	// Get stats
	const [eventsResult, shiftsResult, signupsResult, usersResult] = await Promise.all([
		supabase.from("events").select("*", { count: "exact", head: true }),
		supabase.from("shifts").select("*", { count: "exact", head: true }),
		supabase.from("signups").select("*", { count: "exact", head: true }),
		supabase.from("users").select("role"),
	]);

	const eventsCount = eventsResult.count || 0;
	const shiftsCount = shiftsResult.count || 0;
	const signupsCount = signupsResult.count || 0;

	// Count users per role
	const usersByRole = (usersResult.data || []).reduce(
		(acc, user) => {
			acc[user.role] = (acc[user.role] || 0) + 1;
			return acc;
		},
		{} as Record<Role, number>
	);

	return (
		<div className="container mx-auto p-6">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-3xl font-bold">Admin Dashboard</h1>
				<UserManagementClient />
			</div>
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader>
						<CardTitle>Events</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-3xl font-bold">{eventsCount}</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Shifts</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-3xl font-bold">{shiftsCount}</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Inschrijvingen</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-3xl font-bold">{signupsCount}</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Gebruikers</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-3xl font-bold">
							{(usersResult.data || []).length}
						</p>
					</CardContent>
				</Card>
			</div>
			<div className="mt-6">
				<Card>
					<CardHeader>
						<CardTitle>Gebruikers per rol</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<p>
								<span className="font-medium">Admin:</span>{" "}
								{usersByRole[Role.Admin] || 0}
							</p>
							<p>
								<span className="font-medium">Kernlid:</span>{" "}
								{usersByRole[Role.Kernlid] || 0}
							</p>
							<p>
								<span className="font-medium">Vrijwilliger:</span>{" "}
								{usersByRole[Role.Vrijwilliger] || 0}
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

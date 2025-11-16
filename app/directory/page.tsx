import { createSupabaseServer } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { User, Role } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DirectoryEditorClient } from "@/components/editors/DirectoryEditorClient";
import { UserManagementClient } from "@/components/admin/UserManagementClient";
import { WerkgroepenManager } from "@/components/WerkgroepenManager";

export default async function DirectoryPage() {
	const supabase = createSupabaseServer();
	const { session, profile } = await getSession();
	
	// Try to load with new structure, fallback to simple query if tables don't exist
	let users: any[] = [];
	let error: any = null;

	// First try with full relations
	const { data: usersWithRelations, error: relationsError } = await supabase
		.from("users")
		.select("*, team:teams(*), werkgroepen:user_werkgroepen(werkgroep:werkgroepen(*))")
		.order("name", { ascending: true });

	if (relationsError) {
		// If relations fail, try simple query (tables might not exist yet)
		const { data: simpleUsers, error: simpleError } = await supabase
			.from("users")
			.select("*")
			.order("name", { ascending: true });
		
		if (simpleError) {
			return <div>Fout bij laden van ledenlijst: {simpleError.message}</div>;
		}
		users = simpleUsers || [];
	} else {
		users = usersWithRelations || [];
	}

	const isAdmin = profile?.role === Role.Admin;
	const canManage = profile?.role === Role.Admin || profile?.role === Role.Kernlid;

	// Transform users to include werkgroepen array (if available)
	const transformedUsers = users?.map((user: any) => ({
		...user,
		werkgroepen: user.werkgroepen?.map((uw: any) => uw.werkgroep).filter(Boolean) || [],
	})) || [];

	return (
		<div className="container mx-auto p-6">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-3xl font-bold">Ledenlijst & Werkgroepen</h1>
				{isAdmin && <UserManagementClient />}
			</div>
			
			{canManage && (
				<div className="mb-8">
					<h2 className="text-2xl font-semibold mb-4">Werkgroepen</h2>
					<WerkgroepenManager />
				</div>
			)}

			<div className="mb-8">
				<h2 className="text-2xl font-semibold mb-4">Leden</h2>
				{transformedUsers && transformedUsers.length > 0 ? (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{transformedUsers.map((user: User) => (
						<Card key={user.id}>
							<CardContent className="p-4">
								<div className="flex items-center gap-4 mb-4">
									<Avatar>
										<AvatarImage src={user.avatar_url} />
										<AvatarFallback>
											{user.name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
										</AvatarFallback>
									</Avatar>
									<div className="flex-1">
										<p className="font-semibold">{user.name || user.email}</p>
										<p className="text-sm text-muted-foreground">{user.email}</p>
									</div>
								</div>
								{isAdmin ? (
									<DirectoryEditorClient user={user} />
								) : (
									<div className="space-y-1">
										<p className="text-sm">
											<span className="font-medium">Rol:</span> {user.role}
										</p>
										{user.team && (
											<p className="text-sm">
												<span className="font-medium">Team:</span> {typeof user.team === 'string' ? user.team : user.team.name}
											</p>
										)}
										{user.werkgroepen && user.werkgroepen.length > 0 && (
											<div className="text-sm">
												<span className="font-medium">Werkgroepen:</span>
												<div className="flex flex-wrap gap-1 mt-1">
													{user.werkgroepen.map((wg) => (
														<span key={wg.id} className="text-xs bg-muted px-2 py-1 rounded">
															{wg.name}
														</span>
													))}
												</div>
											</div>
										)}
									</div>
								)}
							</CardContent>
						</Card>
						))}
					</div>
				) : (
					<p>Geen leden gevonden</p>
				)}
			</div>
		</div>
	);
}

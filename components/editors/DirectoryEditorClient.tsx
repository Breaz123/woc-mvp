"use client";

import { useState, useEffect } from "react";
import { User, Role, Team, Werkgroep } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

interface DirectoryEditorClientProps {
	user: User;
}

export function DirectoryEditorClient({ user }: DirectoryEditorClientProps) {
	const [role, setRole] = useState<Role>(user.role);
	// Handle both old (team string) and new (team_id) structure
	const [teamId, setTeamId] = useState((user as any).team_id || "");
	const [teams, setTeams] = useState<Team[]>([]);
	const [werkgroepen, setWerkgroepen] = useState<Werkgroep[]>([]);
	const [userWerkgroepen, setUserWerkgroepen] = useState<Werkgroep[]>(user.werkgroepen || []);
	const [isSaving, setIsSaving] = useState(false);
	const router = useRouter();

	useEffect(() => {
		loadTeams();
		loadWerkgroepen();
		// Load initial user werkgroepen from server
		loadUsers();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const loadTeams = async () => {
		try {
			const response = await fetch("/api/teams");
			if (response.ok) {
				const data = await response.json();
				setTeams(data || []);
			}
		} catch (error) {
			console.error("Fout bij laden teams:", error);
		}
	};

	const loadWerkgroepen = async () => {
		try {
			const response = await fetch("/api/werkgroepen");
			if (response.ok) {
				const data = await response.json();
				setWerkgroepen(data || []);
			}
		} catch (error) {
			console.error("Fout bij laden werkgroepen:", error);
		}
	};

	const loadUsers = async () => {
		try {
			const response = await fetch("/api/users");
			if (response.ok) {
				const data = await response.json();
				// Update userWerkgroepen based on current user from server
				const currentUser = data.find((u: User) => u.id === user.id);
				if (currentUser && currentUser.werkgroepen) {
					setUserWerkgroepen(currentUser.werkgroepen);
				}
			}
		} catch (error) {
			console.error("Fout bij laden gebruikers:", error);
		}
	};

	const handleAddWerkgroep = async (werkgroepId: string) => {
		try {
			const response = await fetch("/api/user-werkgroepen", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					user_id: user.id,
					werkgroep_id: werkgroepId,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Fout bij toevoegen");
			}

			const werkgroep = werkgroepen.find((wg) => wg.id === werkgroepId);
			if (werkgroep) {
				setUserWerkgroepen([...userWerkgroepen, werkgroep]);
			}
			toast.success("Lid toegevoegd aan werkgroep");
			// Reload users to update werkgroepen in other components
			loadUsers();
			router.refresh();
		} catch (error: any) {
			toast.error(error.message || "Fout bij toevoegen");
		}
	};

	const handleRemoveWerkgroep = async (werkgroepId: string) => {
		try {
			const response = await fetch(`/api/user-werkgroepen?user_id=${user.id}&werkgroep_id=${werkgroepId}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Fout bij verwijderen");
			}

			setUserWerkgroepen(userWerkgroepen.filter((wg) => wg.id !== werkgroepId));
			toast.success("Lid verwijderd uit werkgroep");
			// Reload users to update werkgroepen in other components
			loadUsers();
			router.refresh();
		} catch (error: any) {
			toast.error(error.message || "Fout bij verwijderen");
		}
	};

	const handleSave = async () => {
		setIsSaving(true);
		try {
			const response = await fetch("/api/users", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					id: user.id,
					role,
					team_id: teamId || null,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Fout bij opslaan");
			}

			toast.success("Gebruiker bijgewerkt");
			router.refresh();
		} catch (error: any) {
			toast.error(error.message || "Fout bij opslaan");
		} finally {
			setIsSaving(false);
		}
	};

	const hasChanges = role !== user.role || teamId !== ((user as any).team_id || "");
	const availableWerkgroepen = werkgroepen.filter(
		(wg) => !userWerkgroepen.some((uwg) => uwg.id === wg.id)
	);

	return (
		<div className="space-y-3">
			<div>
				<label className="block text-sm font-medium mb-1">Rol</label>
				<select
					value={role}
					onChange={(e) => setRole(e.target.value as Role)}
					className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
				>
					<option value={Role.Admin}>Admin</option>
					<option value={Role.Kernlid}>Kernlid</option>
					<option value={Role.Vrijwilliger}>Vrijwilliger</option>
				</select>
			</div>
			<div>
				<label className="block text-sm font-medium mb-1">Team</label>
				<select
					value={teamId}
					onChange={(e) => setTeamId(e.target.value)}
					className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
				>
					<option value="">Geen team</option>
					{teams.map((team) => (
						<option key={team.id} value={team.id}>
							{team.name}
						</option>
					))}
				</select>
			</div>
			{hasChanges && (
				<Button onClick={handleSave} disabled={isSaving} className="w-full">
					{isSaving ? "Opslaan..." : "Opslaan"}
				</Button>
			)}
			<div>
				<label className="block text-sm font-medium mb-1">Werkgroepen</label>
				<div className="space-y-2">
					{userWerkgroepen.length > 0 && (
						<div className="flex flex-wrap gap-2">
							{userWerkgroepen.map((wg) => (
								<div
									key={wg.id}
									className="flex items-center gap-1 text-xs bg-primary text-primary-foreground px-2 py-1 rounded"
								>
									<span>{wg.name}</span>
									<button
										type="button"
										onClick={() => handleRemoveWerkgroep(wg.id)}
										className="hover:bg-primary/80 rounded p-0.5"
									>
										<X className="h-3 w-3" />
									</button>
								</div>
							))}
						</div>
					)}
					{availableWerkgroepen.length > 0 && (
						<select
							onChange={(e) => {
								if (e.target.value) {
									handleAddWerkgroep(e.target.value);
									e.target.value = "";
								}
							}}
							className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
						>
							<option value="">Werkgroep toevoegen...</option>
							{availableWerkgroepen.map((wg) => (
								<option key={wg.id} value={wg.id}>
									{wg.name}
								</option>
							))}
						</select>
					)}
					{availableWerkgroepen.length === 0 && userWerkgroepen.length === 0 && (
						<p className="text-xs text-muted-foreground">Geen werkgroepen beschikbaar</p>
					)}
				</div>
			</div>
			{!hasChanges && userWerkgroepen.length === (user.werkgroepen?.length || 0) && (
				<div className="space-y-1 text-sm">
					<p>
						<span className="font-medium">Rol:</span> {user.role}
					</p>
					{user.team && (
						<p>
							<span className="font-medium">Team:</span> {typeof user.team === 'string' ? user.team : user.team.name}
						</p>
					)}
					{userWerkgroepen.length > 0 && (
						<div>
							<span className="font-medium">Werkgroepen:</span>
							<div className="flex flex-wrap gap-1 mt-1">
								{userWerkgroepen.map((wg) => (
									<span key={wg.id} className="text-xs bg-muted px-2 py-1 rounded">
										{wg.name}
									</span>
								))}
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
}


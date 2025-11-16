"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Role } from "@/lib/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function UserManagementClient() {
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState({
		email: "",
		password: "",
		role: "Vrijwilliger" as Role,
		name: "",
		team_id: "",
	});
	const [teams, setTeams] = useState<any[]>([]);

	useEffect(() => {
		loadTeams();
	}, []);

	const loadTeams = async () => {
		try {
			const response = await fetch("/api/teams");
			if (response.ok) {
				const data = await response.json();
				setTeams(data);
			}
		} catch (error) {
			console.error("Fout bij laden teams:", error);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		
		if (!formData.email || !formData.password) {
			toast.error("E-mail en wachtwoord zijn verplicht");
			return;
		}

		if (formData.password.length < 6) {
			toast.error("Wachtwoord moet minimaal 6 tekens zijn");
			return;
		}

		setIsLoading(true);

		try {
			const response = await fetch("/api/users", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: formData.email,
					password: formData.password,
					role: formData.role,
					name: formData.name || undefined,
					team_id: formData.team_id || undefined,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Fout bij aanmaken van gebruiker");
			}

			toast.success("Gebruiker succesvol aangemaakt!");
			setIsOpen(false);
			setFormData({
				email: "",
				password: "",
				role: "Vrijwilliger",
				name: "",
				team_id: "",
			});
			router.refresh();
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Fout bij aanmaken van gebruiker"
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			<Button onClick={() => setIsOpen(true)}>Nieuwe gebruiker toevoegen</Button>
			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>Nieuwe gebruiker toevoegen</DialogTitle>
						<DialogDescription>
							Maak een nieuwe gebruiker aan met e-mail en wachtwoord.
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleSubmit}>
						<div className="space-y-4 py-4">
							<div className="space-y-2">
								<label className="text-sm font-medium">E-mailadres *</label>
								<Input
									type="email"
									placeholder="gebruiker@example.com"
									value={formData.email}
									onChange={(e) =>
										setFormData({ ...formData, email: e.target.value })
									}
									disabled={isLoading}
									required
								/>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">Wachtwoord *</label>
								<Input
									type="password"
									placeholder="Minimaal 6 tekens"
									value={formData.password}
									onChange={(e) =>
										setFormData({ ...formData, password: e.target.value })
									}
									disabled={isLoading}
									required
									minLength={6}
								/>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">Rol *</label>
								<select
									value={formData.role}
									onChange={(e) =>
										setFormData({ ...formData, role: e.target.value as Role })
									}
									disabled={isLoading}
									className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
									required
								>
									<option value="Vrijwilliger">Vrijwilliger</option>
									<option value="Kernlid">Kernlid</option>
									<option value="Admin">Admin</option>
								</select>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">Naam (optioneel)</label>
								<Input
									type="text"
									placeholder="Volledige naam"
									value={formData.name}
									onChange={(e) =>
										setFormData({ ...formData, name: e.target.value })
									}
									disabled={isLoading}
								/>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">Team (optioneel)</label>
								<select
									value={formData.team_id}
									onChange={(e) =>
										setFormData({ ...formData, team_id: e.target.value })
									}
									disabled={isLoading}
									className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
								>
									<option value="">Geen team</option>
									{teams.map((team) => (
										<option key={team.id} value={team.id}>
											{team.name}
										</option>
									))}
								</select>
							</div>
						</div>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setIsOpen(false)}
								disabled={isLoading}
							>
								Annuleren
							</Button>
							<Button type="submit" disabled={isLoading}>
								{isLoading ? "Aanmaken..." : "Gebruiker aanmaken"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</>
	);
}


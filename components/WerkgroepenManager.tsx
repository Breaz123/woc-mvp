"use client";

import { useState, useEffect } from "react";
import { Werkgroep, User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Users } from "lucide-react";

export function WerkgroepenManager() {
	const [werkgroepen, setWerkgroepen] = useState<Werkgroep[]>([]);
	const [users, setUsers] = useState<User[]>([]);
	const [isOpen, setIsOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [selectedWerkgroep, setSelectedWerkgroep] = useState<Werkgroep | null>(null);
	const [formData, setFormData] = useState({ name: "", description: "" });
	const router = useRouter();

	useEffect(() => {
		loadWerkgroepen();
		loadUsers();
	}, []);

	const loadWerkgroepen = async () => {
		try {
			const response = await fetch("/api/werkgroepen");
			if (response.ok) {
				const data = await response.json();
				setWerkgroepen(data || []);
			} else {
				// Tables might not exist yet
				setWerkgroepen([]);
			}
		} catch (error) {
			console.error("Fout bij laden werkgroepen:", error);
			setWerkgroepen([]);
		} finally {
			setIsLoading(false);
		}
	};

	const loadUsers = async () => {
		try {
			const response = await fetch("/api/users");
			if (response.ok) {
				const data = await response.json();
				setUsers(data || []);
			}
		} catch (error) {
			console.error("Fout bij laden gebruikers:", error);
			setUsers([]);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.name.trim()) {
			toast.error("Naam is verplicht");
			return;
		}

		try {
			const response = await fetch("/api/werkgroepen", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...formData,
					id: selectedWerkgroep?.id,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Fout bij opslaan");
			}

			toast.success(selectedWerkgroep ? "Werkgroep bijgewerkt" : "Werkgroep aangemaakt");
			setIsOpen(false);
			setFormData({ name: "", description: "" });
			setSelectedWerkgroep(null);
			router.refresh();
			loadWerkgroepen();
		} catch (error: any) {
			toast.error(error.message || "Fout bij opslaan");
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Weet je zeker dat je deze werkgroep wilt verwijderen?")) {
			return;
		}

		try {
			const response = await fetch(`/api/werkgroepen?id=${id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Fout bij verwijderen");
			}

			toast.success("Werkgroep verwijderd");
			router.refresh();
			loadWerkgroepen();
		} catch (error: any) {
			toast.error(error.message || "Fout bij verwijderen");
		}
	};

	const handleAddUser = async (userId: string, werkgroepId: string) => {
		try {
			const response = await fetch("/api/user-werkgroepen", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					user_id: userId,
					werkgroep_id: werkgroepId,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Fout bij toevoegen");
			}

			toast.success("Lid toegevoegd aan werkgroep");
			// Reload both users and werkgroepen to update both sides
			loadUsers();
			loadWerkgroepen();
			router.refresh();
		} catch (error: any) {
			toast.error(error.message || "Fout bij toevoegen");
		}
	};

	const handleRemoveUser = async (userId: string, werkgroepId: string) => {
		try {
			const response = await fetch(`/api/user-werkgroepen?user_id=${userId}&werkgroep_id=${werkgroepId}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Fout bij verwijderen");
			}

			toast.success("Lid verwijderd uit werkgroep");
			// Reload both users and werkgroepen to update both sides
			loadUsers();
			loadWerkgroepen();
			router.refresh();
		} catch (error: any) {
			toast.error(error.message || "Fout bij verwijderen");
		}
	};

	if (isLoading) {
		return <div>Laden...</div>;
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<Dialog open={isOpen} onOpenChange={setIsOpen}>
					<DialogTrigger asChild>
						<Button onClick={() => {
							setSelectedWerkgroep(null);
							setFormData({ name: "", description: "" });
						}}>
							<Plus className="h-4 w-4 mr-2" />
							Werkgroep toevoegen
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>
								{selectedWerkgroep ? "Werkgroep bewerken" : "Nieuwe werkgroep"}
							</DialogTitle>
						</DialogHeader>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div>
								<label className="block text-sm font-medium mb-2">Naam *</label>
								<Input
									value={formData.name}
									onChange={(e) => setFormData({ ...formData, name: e.target.value })}
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-2">Beschrijving</label>
								<Textarea
									value={formData.description}
									onChange={(e) => setFormData({ ...formData, description: e.target.value })}
									rows={3}
								/>
							</div>
							<div className="flex gap-2">
								<Button type="submit">Opslaan</Button>
								<Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
									Annuleren
								</Button>
							</div>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{werkgroepen.map((werkgroep) => {
					const werkgroepUsers = users.filter((u) =>
						u.werkgroepen?.some((wg) => wg.id === werkgroep.id)
					);
					return (
						<Card key={werkgroep.id}>
							<CardHeader>
								<div className="flex items-center justify-between">
									<CardTitle>{werkgroep.name}</CardTitle>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => handleDelete(werkgroep.id)}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
								{werkgroep.description && (
									<p className="text-sm text-muted-foreground">{werkgroep.description}</p>
								)}
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									<div className="flex items-center gap-2 text-sm">
										<Users className="h-4 w-4" />
										<span>{werkgroepUsers.length} leden</span>
									</div>
									<select
										className="w-full text-sm border rounded p-2"
										onChange={(e) => {
											if (e.target.value) {
												handleAddUser(e.target.value, werkgroep.id);
												e.target.value = "";
											}
										}}
									>
										<option value="">Lid toevoegen...</option>
										{users
											.filter((u) => !werkgroepUsers.some((wu) => wu.id === u.id))
											.map((user) => (
												<option key={user.id} value={user.id}>
													{user.name || user.email}
												</option>
											))}
									</select>
									{werkgroepUsers.length > 0 && (
										<div className="space-y-1">
											{werkgroepUsers.map((user) => (
												<div
													key={user.id}
													className="flex items-center justify-between text-sm p-2 bg-muted rounded"
												>
													<span>{user.name || user.email}</span>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleRemoveUser(user.id, werkgroep.id)}
													>
														<Trash2 className="h-3 w-3" />
													</Button>
												</div>
											))}
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>
		</div>
	);
}


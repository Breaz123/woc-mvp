"use client";

import { useState } from "react";
import { PasswordVaultEditor } from "./PasswordVaultEditor";
import { PasswordVault } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface PasswordVaultEditorClientProps {
	passwordVault?: PasswordVault;
}

export function PasswordVaultEditorClient({ passwordVault }: PasswordVaultEditorClientProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const router = useRouter();

	const handleSave = async (data: {
		platform: string;
		username?: string;
		password: string;
		url?: string;
		notes?: string;
		visibility_admin: boolean;
		visibility_kernlid: boolean;
		visibility_custom: boolean;
		allowed_user_ids?: string[];
	}) => {
		try {
			const url = passwordVault 
				? "/api/password-vault" 
				: "/api/password-vault";
			
			const response = await fetch(url, {
				method: passwordVault ? "PUT" : "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					id: passwordVault?.id,
					...data,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Fout bij opslaan");
			}

			toast.success(passwordVault ? "Entry bijgewerkt" : "Entry toegevoegd");
			setIsOpen(false);
			router.refresh();
		} catch (error: any) {
			toast.error(error.message || "Fout bij opslaan");
			throw error;
		}
	};

	const handleDelete = async () => {
		if (!passwordVault) return;
		if (!confirm("Weet je zeker dat je deze entry wilt verwijderen?")) {
			return;
		}

		setIsDeleting(true);
		try {
			const response = await fetch(`/api/password-vault?id=${passwordVault.id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Fout bij verwijderen");
			}

			toast.success("Entry verwijderd");
			router.refresh();
		} catch (error: any) {
			toast.error(error.message || "Fout bij verwijderen");
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<div className="flex gap-2">
			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogTrigger asChild>
					<Button variant="outline" size="sm">
						{passwordVault ? "Bewerken" : "Nieuwe entry toevoegen"}
					</Button>
				</DialogTrigger>
				<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>
							{passwordVault ? "Entry bewerken" : "Nieuwe entry toevoegen"}
						</DialogTitle>
					</DialogHeader>
					<PasswordVaultEditor
						passwordVault={passwordVault}
						onSave={handleSave}
						onCancel={() => setIsOpen(false)}
					/>
				</DialogContent>
			</Dialog>
			{passwordVault && (
				<Button
					variant="destructive"
					size="sm"
					onClick={handleDelete}
					disabled={isDeleting}
				>
					{isDeleting ? "Verwijderen..." : "Verwijderen"}
				</Button>
			)}
		</div>
	);
}


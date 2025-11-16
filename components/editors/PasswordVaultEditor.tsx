"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { PasswordVault, User } from "@/lib/types";
import { toast } from "sonner";
import { Eye, EyeOff, Copy, Check } from "lucide-react";

interface PasswordVaultEditorProps {
	passwordVault?: PasswordVault;
	onSave: (data: {
		platform: string;
		username?: string;
		password: string;
		url?: string;
		notes?: string;
		visibility_admin: boolean;
		visibility_kernlid: boolean;
		visibility_custom: boolean;
		allowed_user_ids?: string[];
	}) => Promise<void>;
	onCancel?: () => void;
}

export function PasswordVaultEditor({
	passwordVault,
	onSave,
	onCancel,
}: PasswordVaultEditorProps) {
	const [platform, setPlatform] = useState(passwordVault?.platform || "");
	const [username, setUsername] = useState(passwordVault?.username || "");
	const [password, setPassword] = useState(passwordVault?.password || "");
	const [url, setUrl] = useState(passwordVault?.url || "");
	const [notes, setNotes] = useState(passwordVault?.notes || "");
	const [visibilityAdmin, setVisibilityAdmin] = useState(
		passwordVault?.visibility_admin ?? true
	);
	const [visibilityKernlid, setVisibilityKernlid] = useState(
		passwordVault?.visibility_kernlid ?? false
	);
	const [visibilityCustom, setVisibilityCustom] = useState(
		passwordVault?.visibility_custom ?? false
	);
	const [selectedUserIds, setSelectedUserIds] = useState<string[]>(
		passwordVault?.allowed_users?.map((u) => u.user_id) || []
	);
	const [users, setUsers] = useState<User[]>([]);
	const [isLoadingUsers, setIsLoadingUsers] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [copied, setCopied] = useState(false);

	// Load users when component mounts or when custom visibility is enabled
	useEffect(() => {
		const loadUsers = async () => {
			if (visibilityCustom) {
				setIsLoadingUsers(true);
				try {
					const response = await fetch("/api/users");
					if (response.ok) {
						const data = await response.json();
						setUsers(data || []);
					}
				} catch (error) {
					console.error("Error loading users:", error);
					toast.error("Fout bij laden van gebruikerslijst");
				} finally {
					setIsLoadingUsers(false);
				}
			}
		};
		loadUsers();
	}, [visibilityCustom]);

	const handleUserToggle = (userId: string) => {
		setSelectedUserIds((prev) =>
			prev.includes(userId)
				? prev.filter((id) => id !== userId)
				: [...prev, userId]
		);
	};

	const handleCopyPassword = () => {
		navigator.clipboard.writeText(password);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
		toast.success("Wachtwoord gekopieerd naar klembord");
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!platform.trim()) {
			toast.error("Platform is verplicht");
			return;
		}
		if (!password.trim()) {
			toast.error("Wachtwoord is verplicht");
			return;
		}

		// Validation: at least one visibility option must be selected
		if (!visibilityAdmin && !visibilityKernlid && !visibilityCustom) {
			toast.error("Selecteer minimaal één zichtbaarheidsoptie");
			return;
		}

		if (visibilityCustom && selectedUserIds.length === 0) {
			toast.error("Selecteer minimaal één gebruiker voor aangepaste zichtbaarheid");
			return;
		}

		setIsSaving(true);
		try {
			await onSave({
				platform: platform.trim(),
				username: username.trim() || undefined,
				password: password,
				url: url.trim() || undefined,
				notes: notes.trim() || undefined,
				visibility_admin: visibilityAdmin,
				visibility_kernlid: visibilityKernlid,
				visibility_custom: visibilityCustom,
				allowed_user_ids: visibilityCustom ? selectedUserIds : undefined,
			});
			toast.success("Password vault entry opgeslagen");
		} catch (error: any) {
			toast.error(error.message || "Fout bij opslaan");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div>
				<label htmlFor="platform" className="block text-sm font-medium mb-2">
					Platform * <span className="text-xs text-muted-foreground">(bijv. Facebook, Instagram, Admin Panel)</span>
				</label>
				<Input
					id="platform"
					value={platform}
					onChange={(e) => setPlatform(e.target.value)}
					placeholder="Facebook"
					required
				/>
			</div>
			<div>
				<label htmlFor="username" className="block text-sm font-medium mb-2">
					Gebruikersnaam / E-mail
				</label>
				<Input
					id="username"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					placeholder="gebruiker@voorbeeld.nl"
				/>
			</div>
			<div>
				<label htmlFor="password" className="block text-sm font-medium mb-2">
					Wachtwoord / Login code * <span className="text-xs text-muted-foreground">(kan wachtwoord of code zijn)</span>
				</label>
				<div className="flex gap-2">
					<Input
						id="password"
						type={showPassword ? "text" : "password"}
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="••••••••"
						className="flex-1"
						required
					/>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => setShowPassword(!showPassword)}
					>
						{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
					</Button>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={handleCopyPassword}
						disabled={!password}
					>
						{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
					</Button>
				</div>
			</div>
			<div>
				<label htmlFor="url" className="block text-sm font-medium mb-2">
					URL
				</label>
				<Input
					id="url"
					type="url"
					value={url}
					onChange={(e) => setUrl(e.target.value)}
					placeholder="https://platform.com/login"
				/>
			</div>
			<div>
				<label htmlFor="notes" className="block text-sm font-medium mb-2">
					Notities
				</label>
				<Textarea
					id="notes"
					value={notes}
					onChange={(e) => setNotes(e.target.value)}
					placeholder="Extra informatie, hints, of instructies..."
					rows={4}
				/>
			</div>

			<div className="pt-4 border-t space-y-4">
				<label className="block text-sm font-medium mb-2">
					Zichtbaarheid
				</label>
				<div className="space-y-3">
					<div className="flex items-center space-x-2">
						<Checkbox
							id="visibility_admin"
							checked={visibilityAdmin}
							onCheckedChange={(checked) =>
								setVisibilityAdmin(checked === true)
							}
						/>
						<label
							htmlFor="visibility_admin"
							className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							Admin
						</label>
					</div>
					<div className="flex items-center space-x-2">
						<Checkbox
							id="visibility_kernlid"
							checked={visibilityKernlid}
							onCheckedChange={(checked) =>
								setVisibilityKernlid(checked === true)
							}
						/>
						<label
							htmlFor="visibility_kernlid"
							className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							Kernleden
						</label>
					</div>
					<div className="flex items-center space-x-2">
						<Checkbox
							id="visibility_custom"
							checked={visibilityCustom}
							onCheckedChange={(checked) =>
								setVisibilityCustom(checked === true)
							}
						/>
						<label
							htmlFor="visibility_custom"
							className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							Specifieke leden
						</label>
					</div>
				</div>

				{visibilityCustom && (
					<div className="mt-4 p-4 border rounded-md space-y-2 max-h-60 overflow-y-auto">
						<label className="text-xs font-medium text-muted-foreground">
							Selecteer leden:
						</label>
						{isLoadingUsers ? (
							<p className="text-sm text-muted-foreground">Laden...</p>
						) : users.length === 0 ? (
							<p className="text-sm text-muted-foreground">
								Geen gebruikers gevonden
							</p>
						) : (
							<div className="space-y-2">
								{users.map((user) => (
									<div key={user.id} className="flex items-center space-x-2">
										<Checkbox
											id={`user-${user.id}`}
											checked={selectedUserIds.includes(user.id)}
											onCheckedChange={() => handleUserToggle(user.id)}
										/>
										<label
											htmlFor={`user-${user.id}`}
											className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
										>
											{user.name || user.email}
										</label>
									</div>
								))}
							</div>
						)}
					</div>
				)}
			</div>

			<div className="flex gap-2">
				<Button type="submit" disabled={isSaving}>
					{isSaving ? "Opslaan..." : "Opslaan"}
				</Button>
				{onCancel && (
					<Button type="button" variant="outline" onClick={onCancel}>
						Annuleren
					</Button>
				)}
			</div>
		</form>
	);
}


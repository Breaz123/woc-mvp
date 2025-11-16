"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PasswordVault } from "@/lib/types";
import { PasswordVaultEditorClient } from "@/components/editors/PasswordVaultEditorClient";
import { Copy, Check, Eye, EyeOff, ExternalLink, Lock } from "lucide-react";
import { toast } from "sonner";

interface PasswordVaultCardProps {
	entry: PasswordVault;
}

export function PasswordVaultCard({ entry }: PasswordVaultCardProps) {
	const [showPassword, setShowPassword] = useState(false);
	const [copied, setCopied] = useState(false);
	const [copiedUsername, setCopiedUsername] = useState(false);

	const handleCopyPassword = () => {
		navigator.clipboard.writeText(entry.password);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
		toast.success("Wachtwoord gekopieerd");
	};

	const handleCopyUsername = () => {
		if (!entry.username) return;
		navigator.clipboard.writeText(entry.username);
		setCopiedUsername(true);
		setTimeout(() => setCopiedUsername(false), 2000);
		toast.success("Gebruikersnaam gekopieerd");
	};

	const handleOpenUrl = () => {
		if (entry.url) {
			window.open(entry.url, "_blank", "noopener,noreferrer");
		}
	};

	return (
		<Card className="hover:shadow-lg transition-shadow">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Lock className="h-5 w-5 text-primary" />
						<CardTitle className="text-lg">{entry.platform}</CardTitle>
					</div>
					<PasswordVaultEditorClient passwordVault={entry} />
				</div>
			</CardHeader>
			<CardContent className="space-y-3">
				{entry.username && (
					<div>
						<label className="text-xs font-medium text-muted-foreground">Gebruikersnaam</label>
						<div className="flex gap-2 items-center mt-1">
							<p className="text-sm font-mono flex-1 break-all">{entry.username}</p>
							<Button
								variant="ghost"
								size="sm"
								onClick={handleCopyUsername}
								className="h-8 w-8 p-0"
							>
								{copiedUsername ? (
									<Check className="h-4 w-4 text-green-600" />
								) : (
									<Copy className="h-4 w-4" />
								)}
							</Button>
						</div>
					</div>
				)}
				<div>
					<label className="text-xs font-medium text-muted-foreground">Wachtwoord</label>
					<div className="flex gap-2 items-center mt-1">
						<p className="text-sm font-mono flex-1 break-all">
							{showPassword ? entry.password : "•".repeat(12)}
						</p>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setShowPassword(!showPassword)}
							className="h-8 w-8 p-0"
						>
							{showPassword ? (
								<EyeOff className="h-4 w-4" />
							) : (
								<Eye className="h-4 w-4" />
							)}
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={handleCopyPassword}
							className="h-8 w-8 p-0"
						>
							{copied ? (
								<Check className="h-4 w-4 text-green-600" />
							) : (
								<Copy className="h-4 w-4" />
							)}
						</Button>
					</div>
				</div>
				{entry.url && (
					<div>
						<Button
							variant="outline"
							size="sm"
							onClick={handleOpenUrl}
							className="w-full"
						>
							<ExternalLink className="h-4 w-4 mr-2" />
							Open platform
						</Button>
					</div>
				)}
				{entry.notes && (
					<div>
						<label className="text-xs font-medium text-muted-foreground">Notities</label>
						<p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
							{entry.notes}
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}


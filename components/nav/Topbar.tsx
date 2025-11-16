"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createSupabaseBrowser } from "@/lib/supabase/clients";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Session } from "@supabase/supabase-js";
import type { User, Role } from "@/lib/types";
import { MobileMenu } from "./MobileMenu";
import { Checkbox } from "@/components/ui/checkbox";
import { hasCookieConsent } from "@/components/CookieBanner";
import { fadeInDown, scaleIn, transitionNormal } from "@/lib/animations";
import Link from "next/link";

export function Topbar({ session, profile }: { session: Session | null; profile: User | null }) {
	const role: Role | undefined = profile?.role;
	const router = useRouter();
	const supabase = createSupabaseBrowser();
	const [isLoginOpen, setIsLoginOpen] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [loginMode, setLoginMode] = useState<"password" | "magic-link">("password");
	const [cookieConsent, setCookieConsent] = useState(false);

	const handleSignIn = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email.trim()) {
			toast.error("Vul een geldig e-mailadres in");
			return;
		}

		// Check cookie consent if not already given
		if (!hasCookieConsent() && !cookieConsent) {
			toast.error("Je moet akkoord gaan met het cookiebeleid om in te loggen");
			return;
		}

		// Save consent if checkbox was checked
		if (cookieConsent && !hasCookieConsent()) {
			localStorage.setItem("woc-cookie-consent", JSON.stringify({
				accepted: true,
				date: new Date().toISOString(),
			}));
		}

		setIsLoading(true);

		if (loginMode === "password") {
			if (!password.trim()) {
				toast.error("Vul een wachtwoord in");
				setIsLoading(false);
				return;
			}

			const { data, error } = await supabase.auth.signInWithPassword({
				email: email.trim(),
				password: password.trim(),
			});

			if (error) {
				toast.error(error.message || "Ongeldige inloggegevens");
			} else {
				toast.success("Succesvol ingelogd!");
				setIsLoginOpen(false);
				setEmail("");
				setPassword("");
				router.refresh();
			}
		} else {
			// Magic link mode
			const { error } = await supabase.auth.signInWithOtp({ email: email.trim() });
			
			if (error) {
				toast.error(error.message || "Er is een fout opgetreden bij het inloggen");
			} else {
				toast.success("Check je e-mail voor de login link!");
				setIsLoginOpen(false);
				setEmail("");
			}
		}

		setIsLoading(false);
	};

	const handleSignOut = async () => {
		await supabase.auth.signOut();
		router.push("/");
		router.refresh();
		toast.success("Je bent uitgelogd");
	};

	if (!session || !profile) {
		return (
			<motion.header
				initial="initial"
				animate="animate"
				variants={fadeInDown}
				transition={{
					duration: 0.4,
					ease: [0.16, 1, 0.3, 1],
				}}
				className="sticky top-0 z-50 border-b border-border/40 bg-gradient-to-r from-card via-card to-card/95 backdrop-blur-md shadow-sm"
			>
				<div className="flex items-center justify-between h-16 px-6">
					<div className="flex items-center gap-4">
						<MobileMenu role={role} />
						<div className="hidden md:flex items-center gap-3">
							<div className="h-8 w-px bg-border/60" />
							<div className="flex flex-col">
								<span className="text-lg font-bold text-primary leading-none">WOC</span>
								<span className="text-xs text-muted-foreground leading-none mt-0.5">Ouderscomité</span>
							</div>
						</div>
					</div>
					<div className="flex items-center gap-4">
						<Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
						<motion.div
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							transition={{
								type: "spring",
								stiffness: 400,
								damping: 25,
							}}
						>
							<Button variant="outline" onClick={() => setIsLoginOpen(true)}>
								Inloggen
							</Button>
						</motion.div>
						<DialogContent className="sm:max-w-md">
							<DialogHeader>
								<DialogTitle>Inloggen</DialogTitle>
								<DialogDescription>
									{loginMode === "password"
										? "Voer je e-mailadres en wachtwoord in."
										: "Voer je e-mailadres in om een login link te ontvangen."}
								</DialogDescription>
							</DialogHeader>
							<form onSubmit={handleSignIn}>
								<div className="space-y-4 py-4">
									<motion.div
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{
											duration: 0.4,
											ease: [0.16, 1, 0.3, 1],
											delay: 0.1,
										}}
									>
										<Input
											type="email"
											placeholder="jouw@email.nl"
											value={email}
											onChange={(e) => setEmail(e.target.value)}
											disabled={isLoading}
											required
											className="transition-all focus:ring-2 focus:ring-primary/20"
										/>
									</motion.div>
									{loginMode === "password" && (
										<motion.div
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{
												duration: 0.4,
												ease: [0.16, 1, 0.3, 1],
												delay: 0.15,
											}}
										>
											<Input
												type="password"
												placeholder="Wachtwoord"
												value={password}
												onChange={(e) => setPassword(e.target.value)}
												disabled={isLoading}
												required
												className="transition-all focus:ring-2 focus:ring-primary/20"
											/>
										</motion.div>
									)}
									{!hasCookieConsent() && (
										<motion.div
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											transition={{
												duration: 0.4,
												ease: [0.16, 1, 0.3, 1],
												delay: 0.2,
											}}
											className="flex items-start space-x-2 pt-2"
										>
											<Checkbox
												id="cookie-consent"
												checked={cookieConsent}
												onCheckedChange={(checked) => setCookieConsent(checked === true)}
												disabled={isLoading}
											/>
											<label
												htmlFor="cookie-consent"
												className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
											>
												Ik ga akkoord met het{" "}
												<Link href="/privacy" className="text-primary hover:underline" target="_blank">
													cookiebeleid
												</Link>
											</label>
										</motion.div>
									)}
									<div className="flex items-center justify-between text-sm">
										<button
											type="button"
											onClick={() => setLoginMode(loginMode === "password" ? "magic-link" : "password")}
											className="text-primary hover:underline transition-colors"
										>
											{loginMode === "password"
												? "Gebruik magic link in plaats daarvan"
												: "Gebruik wachtwoord in plaats daarvan"}
										</button>
									</div>
								</div>
								<DialogFooter>
									<motion.div
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.97 }}
										transition={{
											type: "spring",
											stiffness: 400,
											damping: 25,
										}}
									>
										<Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
											{isLoading
												? "Inloggen..."
												: loginMode === "password"
												? "Inloggen"
												: "Verstuur login link"}
										</Button>
									</motion.div>
								</DialogFooter>
							</form>
						</DialogContent>
					</Dialog>
					</div>
				</div>
			</motion.header>
		);
	}

	return (
		<motion.header
			initial="initial"
			animate="animate"
			variants={fadeInDown}
			transition={{
				duration: 0.4,
				ease: [0.16, 1, 0.3, 1],
			}}
			className="sticky top-0 z-50 border-b border-border/40 bg-gradient-to-r from-card via-card to-card/95 backdrop-blur-md shadow-sm"
		>
			<div className="flex items-center justify-between h-16 px-6">
				<div className="flex items-center gap-4">
					<MobileMenu role={role} />
					<div className="hidden md:flex items-center gap-3">
						<div className="h-8 w-px bg-border/60" />
						<div className="flex flex-col">
							<span className="text-lg font-bold text-primary leading-none">WOC</span>
							<span className="text-xs text-muted-foreground leading-none mt-0.5">Ouderscomité</span>
						</div>
					</div>
				</div>
				<div className="flex items-center gap-4">
					<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<motion.div
							whileHover={{ scale: 1.1 }}
							whileTap={{ scale: 0.9 }}
							transition={{
								type: "spring",
								stiffness: 400,
								damping: 25,
							}}
						>
							<Button variant="ghost" className="relative h-10 w-10 rounded-full">
								<Avatar className="ring-2 ring-primary/20">
									<AvatarImage src={profile.avatar_url} />
									<AvatarFallback>
										{profile.email?.charAt(0).toUpperCase() || session.user.email?.charAt(0).toUpperCase()}
									</AvatarFallback>
								</Avatar>
							</Button>
						</motion.div>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="w-56" align="end">
						<DropdownMenuLabel>Account</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={handleSignOut}>
							Uitloggen
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
				</div>
			</div>
		</motion.header>
	);
}


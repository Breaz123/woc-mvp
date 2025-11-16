"use client";

import { Shift, Signup, User } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { nl } from "date-fns/locale/nl";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Info, Trash2 } from "lucide-react";
import { fadeInUp, cardHover, transitionNormal, staggerContainer } from "@/lib/animations";

interface ShiftCardProps {
	shift: Shift;
	count: number;
	currentUserSignupId?: string;
	onDelete?: () => void;
	showDelete?: boolean;
	editButton?: React.ReactNode;
	showEdit?: boolean;
	allowUnsignup?: boolean;
}

export function ShiftCard({
	shift,
	count,
	currentUserSignupId,
	onDelete,
	showDelete = false,
	editButton,
	showEdit = false,
	allowUnsignup = true,
}: ShiftCardProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [isDetailsOpen, setIsDetailsOpen] = useState(false);
	const [signups, setSignups] = useState<(Signup & { user?: User })[]>([]);
	const [isLoadingSignups, setIsLoadingSignups] = useState(false);
	const isFull = count >= shift.max_slots;

	const startDate = new Date(shift.start_time);
	const endDate = new Date(shift.end_time);

	const fetchSignups = async () => {
		setIsLoadingSignups(true);
		try {
			const response = await fetch(`/api/signups?shift_id=${shift.id}`);
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Fout bij ophalen van inschrijvingen");
			}

			setSignups(data.signups || []);
		} catch (error: any) {
			toast.error(error.message || "Fout bij ophalen van inschrijvingen");
		} finally {
			setIsLoadingSignups(false);
		}
	};

	const handleDetailsClick = () => {
		setIsDetailsOpen(true);
		if (signups.length === 0) {
			fetchSignups();
		}
	};

	const handleSignup = async () => {
		setIsLoading(true);
		try {
			const response = await fetch("/api/signups", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ shift_id: shift.id }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Fout bij inschrijven");
			}

			toast.success("Succesvol ingeschreven");
			router.refresh();
		} catch (error: any) {
			toast.error(error.message || "Fout bij inschrijven");
		} finally {
			setIsLoading(false);
		}
	};

	const handleUnsignup = async () => {
		if (!currentUserSignupId) {
			toast.error("Inschrijving niet gevonden");
			return;
		}

		setIsLoading(true);
		try {
			const response = await fetch(`/api/signups?id=${currentUserSignupId}`, {
				method: "DELETE",
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Fout bij uitschrijven");
			}

			toast.success("Succesvol uitgeschreven");
			router.refresh();
		} catch (error: any) {
			toast.error(error.message || "Fout bij uitschrijven");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<motion.div
			initial="initial"
			animate="animate"
			variants={fadeInUp}
			transition={{
				duration: 0.4,
				ease: [0.16, 1, 0.3, 1],
			}}
		>
			<motion.div
				whileHover="hover"
				variants={{
					hover: cardHover,
				}}
				transition={{
					type: "spring",
					stiffness: 300,
					damping: 25,
				}}
			>
				<Card className="border-2 hover:border-primary/20 transition-colors duration-300">
					<CardHeader>
						<CardTitle className="flex items-center justify-between">
							<span className="text-lg font-bold">{shift.title}</span>
							<div className="flex items-center gap-2">
								<motion.div
									whileHover={{ scale: 1.1 }}
									whileTap={{ scale: 0.95 }}
									transition={{
										type: "spring",
										stiffness: 400,
										damping: 25,
									}}
								>
									<Badge variant={isFull ? "destructive" : "default"} className="text-sm font-semibold">
										{count}/{shift.max_slots}
									</Badge>
								</motion.div>
								{showEdit && editButton}
								{showDelete && onDelete && (
									<motion.div
										whileHover={{ scale: 1.1 }}
										whileTap={{ scale: 0.95 }}
										transition={{
											type: "spring",
											stiffness: 400,
											damping: 25,
										}}
									>
										<Button
											variant="ghost"
											size="icon"
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation();
												onDelete();
											}}
											className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
											title="Verwijderen"
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</motion.div>
								)}
							</div>
						</CardTitle>
					</CardHeader>
			<CardContent>
				{shift.description && (
					<p className="text-sm text-muted-foreground mb-4">
						{shift.description}
					</p>
				)}
				<div className="space-y-2 mb-4">
					<p className="text-sm">
						<span className="font-medium">Tijd:</span>{" "}
						{format(startDate, "d MMM yyyy HH:mm", { locale: nl })} -{" "}
						{format(endDate, "HH:mm", { locale: nl })}
					</p>
					{shift.event && (
						<p className="text-sm">
							<span className="font-medium">Event:</span> {shift.event.title}
						</p>
					)}
				</div>
				{!currentUserSignupId && !isFull && (
					<motion.div
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.97 }}
						transition={{
							type: "spring",
							stiffness: 400,
							damping: 25,
						}}
					>
						<Button
							onClick={handleSignup}
							className="w-full"
							disabled={isLoading}
						>
							+ Inschrijven
						</Button>
					</motion.div>
				)}
				{currentUserSignupId && allowUnsignup && (
					<motion.div
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.97 }}
						transition={{
							type: "spring",
							stiffness: 400,
							damping: 25,
						}}
					>
						<Button
							variant="outline"
							onClick={handleUnsignup}
							className="w-full"
							disabled={isLoading}
						>
							Uitschrijven
						</Button>
					</motion.div>
				)}
				{isFull && !currentUserSignupId && (
					<Button disabled className="w-full">
						Vol
					</Button>
				)}
				<motion.div
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.97 }}
					transition={{
						type: "spring",
						stiffness: 400,
						damping: 25,
					}}
				>
					<Button
						variant="outline"
						onClick={handleDetailsClick}
						className="w-full mt-2"
					>
						<Info className="w-4 h-4 mr-2" />
						Details
					</Button>
				</motion.div>
			</CardContent>
				</Card>
			</motion.div>
			<Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
				<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>{shift.title}</DialogTitle>
						<DialogDescription>
							Shift details en ingeschreven gebruikers
						</DialogDescription>
					</DialogHeader>
					<motion.div
						variants={staggerContainer}
						initial="initial"
						animate="animate"
						transition={{
							duration: 0.4,
							ease: [0.16, 1, 0.3, 1],
						}}
						className="space-y-6"
					>
						{shift.description && (
							<div>
								<h3 className="font-semibold mb-2">Beschrijving</h3>
								<p className="text-sm text-muted-foreground">
									{shift.description}
								</p>
							</div>
						)}
						<div>
							<h3 className="font-semibold mb-2">Informatie</h3>
							<div className="space-y-2 text-sm">
								<p>
									<span className="font-medium">Tijd:</span>{" "}
									{format(startDate, "d MMMM yyyy 'om' HH:mm", {
										locale: nl,
									})}{" "}
									- {format(endDate, "HH:mm", { locale: nl })}
								</p>
								{shift.event && (
									<p>
										<span className="font-medium">Event:</span>{" "}
										{shift.event.title}
									</p>
								)}
								<p>
									<span className="font-medium">Plaatsen:</span> {count} /{" "}
									{shift.max_slots}
								</p>
							</div>
						</div>
						<div>
							<h3 className="font-semibold mb-3">
								Ingeschreven gebruikers ({signups.length})
							</h3>
							{isLoadingSignups ? (
								<p className="text-sm text-muted-foreground">
									Bezig met laden...
								</p>
							) : signups.length > 0 ? (
								<div className="space-y-2">
									<AnimatePresence>
										{signups.map((signup, index) => (
											<motion.div
												key={signup.id}
												initial={{ opacity: 0, y: 10 }}
												animate={{ opacity: 1, y: 0 }}
												exit={{ opacity: 0, y: -10 }}
												transition={{
													duration: 0.4,
													ease: [0.16, 1, 0.3, 1],
													delay: index * 0.03,
												}}
												className="flex items-center gap-3 p-3 rounded-md border hover:bg-muted/50 transition-colors"
											>
											<Avatar>
												<AvatarImage src={signup.user?.avatar_url} />
												<AvatarFallback>
													{signup.user?.name
														?.charAt(0)
														.toUpperCase() ||
														signup.user?.email?.charAt(0).toUpperCase() ||
														"?"}
												</AvatarFallback>
											</Avatar>
											<div className="flex-1">
												<p className="font-medium text-sm">
													{signup.user?.name || signup.user?.email || "Onbekend"}
												</p>
												{signup.user?.email && signup.user?.name && (
													<p className="text-xs text-muted-foreground">
														{signup.user.email}
													</p>
												)}
												{signup.user?.team && (
													<p className="text-xs text-muted-foreground">
														Team: {signup.user.team.name}
													</p>
												)}
											</div>
											<Badge variant="secondary">
												{format(new Date(signup.created_at), "d MMM", {
													locale: nl,
												})}
											</Badge>
										</motion.div>
									))}
									</AnimatePresence>
								</div>
							) : (
								<p className="text-sm text-muted-foreground">
									Nog niemand ingeschreven
								</p>
							)}
						</div>
					</motion.div>
				</DialogContent>
			</Dialog>
		</motion.div>
	);
}

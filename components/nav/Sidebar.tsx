"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Role } from "@/lib/types";
import { fadeIn, slideInLeft, transitionNormal } from "@/lib/animations";
import {
	Calendar,
	Clock,
	Newspaper,
	Users,
	Heart,
	Info,
	Lock,
	Mail,
	LayoutDashboard,
	KeyRound,
} from "lucide-react";

const navItems = [
	{ href: "/", label: "Home", icon: LayoutDashboard },
	{ href: "/events", label: "Events", icon: Calendar },
	{ href: "/shifts", label: "Shifts", icon: Clock },
	{ href: "/my-shifts", label: "Mijn Shifts", icon: Clock },
	{ href: "/news", label: "Nieuws", icon: Newspaper },
	{ href: "/directory", label: "Ledenlijst", icon: Users },
	{ href: "/sponsors", label: "Sponsors", icon: Heart },
];

const staticPages = [
	{ href: "/about", label: "Over Ons", icon: Info },
	{ href: "/privacy", label: "Privacy", icon: Lock },
	{ href: "/contact", label: "Contact", icon: Mail },
];

export function Sidebar({ role }: { role?: Role }) {
	const pathname = usePathname();

	return (
		<motion.aside
			initial="initial"
			animate="animate"
			variants={slideInLeft}
			transition={{
				duration: 0.4,
				ease: [0.16, 1, 0.3, 1],
			}}
			className="hidden md:block w-64 border-r border-border/40 bg-gradient-to-b from-card via-card to-card/95 backdrop-blur-md min-h-screen shadow-sm"
		>
			<div className="sticky top-0 z-40 bg-card/80 backdrop-blur-sm border-b border-border/40">
				<motion.div
					variants={fadeIn}
					transition={{
						duration: 0.4,
						ease: [0.16, 1, 0.3, 1],
					}}
				>
					<Link href="/" className="block group">
						<motion.div
							whileHover={{ scale: 1.01 }}
							whileTap={{ scale: 0.99 }}
							className="flex items-center gap-3 px-6 py-5"
						>
							<div className="relative">
								<Image
									src="/woc-logo.jpg"
									alt="WOC Logo"
									width={44}
									height={44}
									className="object-contain rounded-lg ring-2 ring-primary/10"
								/>
							</div>
							<div className="flex flex-col">
								<h2 className="text-xl font-bold text-primary leading-none tracking-tight">WOC</h2>
								<p className="text-xs text-muted-foreground leading-none mt-1">Ouderscomité</p>
							</div>
						</motion.div>
					</Link>
				</motion.div>
			</div>
			<div className="px-4 pt-4">
			<nav className="space-y-1">
				{navItems.map((item, index) => {
					const Icon = item.icon;
					const isActive = pathname === item.href;
					return (
						<motion.div
							key={item.href}
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{
								duration: 0.4,
								ease: [0.16, 1, 0.3, 1],
								delay: index * 0.03,
							}}
						>
							<Link href={item.href}>
								<motion.div
									whileHover={{ x: 4 }}
									whileTap={{ scale: 0.97 }}
									transition={{
										type: "spring",
										stiffness: 400,
										damping: 25,
									}}
									className={cn(
										"flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 relative",
										isActive
											? "bg-primary text-primary-foreground shadow-md"
											: "hover:bg-sidebar-accent text-muted-foreground hover:text-sidebar-accent-foreground"
									)}
								>
									{isActive && (
										<motion.div
											layoutId="activeNavIndicator"
											className="absolute left-0 top-0 bottom-0 w-1 bg-primary-foreground rounded-r-full"
											transition={{
												type: "spring",
												stiffness: 300,
												damping: 30,
											}}
										/>
									)}
									<Icon className="w-5 h-5 relative z-10" />
									<span className="relative z-10 font-medium">{item.label}</span>
								</motion.div>
							</Link>
						</motion.div>
					);
				})}
				<div className="pt-6 mt-6 border-t space-y-1">
					{staticPages.map((item, index) => {
						const Icon = item.icon;
						const isActive = pathname === item.href;
						return (
							<motion.div
								key={item.href}
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{
									duration: 0.4,
									ease: [0.16, 1, 0.3, 1],
									delay: (navItems.length + index) * 0.03,
								}}
							>
								<Link href={item.href}>
									<motion.div
										whileHover={{ x: 4 }}
										whileTap={{ scale: 0.97 }}
										transition={{
											type: "spring",
											stiffness: 400,
											damping: 25,
										}}
										className={cn(
											"flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 relative",
											isActive
												? "bg-primary text-primary-foreground shadow-md"
												: "hover:bg-sidebar-accent text-muted-foreground hover:text-foreground"
										)}
									>
										{isActive && (
											<motion.div
												layoutId="activeNavIndicatorStatic"
												className="absolute left-0 top-0 bottom-0 w-1 bg-primary-foreground rounded-r-full"
												transition={{
													type: "spring",
													stiffness: 300,
													damping: 30,
												}}
											/>
										)}
										<Icon className="w-5 h-5 relative z-10" />
										<span className="relative z-10 font-medium">{item.label}</span>
									</motion.div>
								</Link>
							</motion.div>
						);
					})}
					{(role === Role.Admin || role === Role.Kernlid) && (
						<motion.div
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{
								duration: 0.4,
								ease: [0.16, 1, 0.3, 1],
								delay: (navItems.length + staticPages.length) * 0.03,
							}}
						>
							<Link href="/password-vault">
								<motion.div
									whileHover={{ x: 4 }}
									whileTap={{ scale: 0.97 }}
									transition={{
										type: "spring",
										stiffness: 400,
										damping: 25,
									}}
									className={cn(
										"flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 relative",
										pathname === "/password-vault"
											? "bg-primary text-primary-foreground shadow-md"
											: "hover:bg-sidebar-accent text-muted-foreground hover:text-foreground"
									)}
								>
									{pathname === "/password-vault" && (
										<motion.div
											layoutId="activeNavIndicatorVault"
											className="absolute left-0 top-0 bottom-0 w-1 bg-primary-foreground rounded-r-full"
											transition={{
												type: "spring",
												stiffness: 300,
												damping: 30,
											}}
										/>
									)}
									<KeyRound className="w-5 h-5 relative z-10" />
									<span className="relative z-10 font-medium">Password Vault</span>
								</motion.div>
							</Link>
						</motion.div>
					)}
				</div>
			</nav>
			</div>
		</motion.aside>
	);
}


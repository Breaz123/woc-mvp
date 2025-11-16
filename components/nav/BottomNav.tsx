"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
	Calendar,
	Clock,
	Newspaper,
	LayoutDashboard,
} from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { fadeInUp, transitionNormal } from "@/lib/animations";

const mainNavItems = [
	{ href: "/", label: "Home", icon: LayoutDashboard },
	{ href: "/events", label: "Events", icon: Calendar },
	{ href: "/shifts", label: "Shifts", icon: Clock },
	{ href: "/news", label: "Nieuws", icon: Newspaper },
];

export function BottomNav({ session }: { session: Session | null }) {
	const pathname = usePathname();

	// Only show bottom nav when logged in
	if (!session) {
		return null;
	}

	return (
		<motion.nav
			initial="initial"
			animate="animate"
			variants={fadeInUp}
			transition={transitionNormal}
			className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-t md:hidden shadow-lg"
		>
			<div className="flex items-center justify-around h-16">
				{mainNavItems.map((item, index) => {
					const Icon = item.icon;
					const isActive = pathname === item.href;
					return (
						<motion.div
							key={item.href}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{
								duration: 0.4,
								ease: [0.16, 1, 0.3, 1],
								delay: index * 0.08,
							}}
							className="flex-1"
						>
							<Link href={item.href}>
								<motion.div
									whileHover={{ scale: 1.1 }}
									whileTap={{ scale: 0.9 }}
									transition={{
										type: "spring",
										stiffness: 400,
										damping: 25,
									}}
									className={cn(
										"flex flex-col items-center justify-center gap-1 h-full relative",
										isActive
											? "text-primary"
											: "text-muted-foreground"
									)}
								>
									{isActive && (
										<motion.div
											layoutId="activeBottomNav"
											className="absolute top-0 left-0 right-0 h-1 bg-primary rounded-b-full"
											transition={{
												type: "spring",
												stiffness: 300,
												damping: 30,
											}}
										/>
									)}
									<Icon className="w-5 h-5 relative z-10" />
									<span className="text-xs font-medium relative z-10">{item.label}</span>
								</motion.div>
							</Link>
						</motion.div>
					);
				})}
			</div>
		</motion.nav>
	);
}


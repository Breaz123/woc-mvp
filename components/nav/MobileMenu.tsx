"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Role } from "@/lib/types";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
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
	Menu,
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

export function MobileMenu({ role }: { role?: Role }) {
	const [open, setOpen] = useState(false);
	const pathname = usePathname();

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button variant="ghost" size="icon" className="md:hidden h-9 w-9">
					<Menu className="h-5 w-5" />
					<span className="sr-only">Menu openen</span>
				</Button>
			</SheetTrigger>
			<SheetContent side="left" className="w-64 p-0">
				<SheetHeader className="p-5 border-b border-border/40 bg-gradient-to-r from-card to-card/95">
					<SheetTitle className="text-left">
						<div className="flex items-center gap-3">
							<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
								<span className="text-lg font-bold text-primary">W</span>
							</div>
							<div className="flex flex-col">
								<h2 className="text-lg font-bold text-primary leading-none">WOC</h2>
								<p className="text-xs text-muted-foreground leading-none mt-0.5">Ouderscomité</p>
							</div>
						</div>
					</SheetTitle>
				</SheetHeader>
				<nav className="flex flex-col p-4 space-y-1">
					{navItems.map((item) => {
						const Icon = item.icon;
						const isActive = pathname === item.href;
						return (
							<Link
								key={item.href}
								href={item.href}
								onClick={() => setOpen(false)}
								className={cn(
									"flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
									isActive
										? "bg-primary text-primary-foreground"
										: "hover:bg-sidebar-accent text-muted-foreground hover:text-sidebar-accent-foreground"
								)}
							>
								<Icon className="w-5 h-5" />
								<span>{item.label}</span>
							</Link>
						);
					})}
					<div className="pt-4 mt-4 border-t">
						{staticPages.map((item) => {
							const Icon = item.icon;
							const isActive = pathname === item.href;
							return (
								<Link
									key={item.href}
									href={item.href}
									onClick={() => setOpen(false)}
									className={cn(
										"flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
										isActive
											? "bg-primary text-primary-foreground"
											: "hover:bg-accent text-muted-foreground hover:text-foreground"
									)}
								>
									<Icon className="w-5 h-5" />
									<span>{item.label}</span>
								</Link>
							);
						})}
						{(role === Role.Admin || role === Role.Kernlid) && (
							<Link
								href="/password-vault"
								onClick={() => setOpen(false)}
								className={cn(
									"flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
									pathname === "/password-vault"
										? "bg-primary text-primary-foreground"
										: "hover:bg-accent text-muted-foreground hover:text-foreground"
								)}
							>
								<KeyRound className="w-5 h-5" />
								<span>Password Vault</span>
							</Link>
						)}
					</div>
				</nav>
			</SheetContent>
		</Sheet>
	);
}


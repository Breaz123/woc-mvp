"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Route labels mapping
const routeLabels: Record<string, string> = {
	events: "Events",
	shifts: "Shifts",
	"my-shifts": "Mijn Shifts",
	news: "Nieuws",
	directory: "Ledenlijst",
	sponsors: "Sponsors",
	about: "Over Ons",
	privacy: "Privacy",
	contact: "Contact",
	admin: "Admin",
};

// Routes that should not show breadcrumbs (home page)
const hideBreadcrumbsFor = ["/"];

export function Breadcrumbs() {
	const pathname = usePathname();
	const [dynamicLabel, setDynamicLabel] = useState<string | null>(null);

	// Fetch title for dynamic routes
	useEffect(() => {
		const fetchDynamicLabel = async () => {
			const eventMatch = pathname.match(/^\/events\/([^\/]+)$/);
			const newsMatch = pathname.match(/^\/news\/([^\/]+)$/);

			if (eventMatch) {
				const eventId = eventMatch[1];
				try {
					const response = await fetch(`/api/events?id=${eventId}`);
					if (response.ok) {
						const data = await response.json();
						if (data.title) {
							setDynamicLabel(data.title);
						}
					}
				} catch (error) {
					console.error("Error fetching event title:", error);
				}
			} else if (newsMatch) {
				const newsId = newsMatch[1];
				try {
					const response = await fetch(`/api/news?id=${newsId}`);
					if (response.ok) {
						const data = await response.json();
						if (data.title) {
							setDynamicLabel(data.title);
						}
					}
				} catch (error) {
					console.error("Error fetching news title:", error);
				}
			} else {
				setDynamicLabel(null);
			}
		};

		fetchDynamicLabel();
	}, [pathname]);

	// Don't show breadcrumbs on home page
	if (hideBreadcrumbsFor.includes(pathname)) {
		return null;
	}

	// Split pathname into segments
	const segments = pathname.split("/").filter(Boolean);

	// Build breadcrumb items
	const breadcrumbItems = segments.map((segment, index) => {
		const href = "/" + segments.slice(0, index + 1).join("/");
		const isLast = index === segments.length - 1;
		let label = routeLabels[segment] || segment;

		// Use dynamic label if available for the last segment
		if (isLast && dynamicLabel) {
			label = dynamicLabel;
		}

		return {
			href,
			label,
			isLast,
		};
	});

	return (
		<Breadcrumb className="mb-4">
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink asChild>
						<Link href="/">Home</Link>
					</BreadcrumbLink>
				</BreadcrumbItem>
				{breadcrumbItems.map((item, index) => (
					<div key={item.href} className="flex items-center">
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							{item.isLast ? (
								<BreadcrumbPage>{item.label}</BreadcrumbPage>
							) : (
								<BreadcrumbLink asChild>
									<Link href={item.href}>{item.label}</Link>
								</BreadcrumbLink>
							)}
						</BreadcrumbItem>
					</div>
				))}
			</BreadcrumbList>
		</Breadcrumb>
	);
}


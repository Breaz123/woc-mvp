"use client";

import { Event } from "@/lib/types";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { nl } from "date-fns/locale/nl";
import { EventDeleteButton } from "@/components/editors/EventDeleteButton";
import { EventEditButton } from "@/components/editors/EventEditButton";
import { cardHover, fadeInUp, transitionNormal } from "@/lib/animations";
import Image from "next/image";

interface EventCardProps {
	event: Event;
	canEdit: boolean;
}

export function EventCard({ event, canEdit }: EventCardProps) {
	const eventDate = new Date(event.date);

	return (
		<motion.div
			initial="initial"
			animate="animate"
			variants={fadeInUp}
			transition={{
				duration: 0.4,
				ease: [0.16, 1, 0.3, 1],
			}}
			className="relative group"
		>
			<Link href={`/events/${event.id}`}>
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
					<Card className="overflow-hidden border-2 hover:border-primary/20 transition-colors duration-300">
						{event.image_url && (
							<motion.div
								whileHover={{ scale: 1.05 }}
								transition={{
									type: "spring",
									stiffness: 300,
									damping: 25,
								}}
								className="relative w-full h-48 overflow-hidden"
							>
								<Image
									src={event.image_url}
									alt={event.title}
									fill
									className="object-cover"
									style={{ willChange: "transform" }}
								/>
							</motion.div>
						)}
						<CardHeader>
							<CardTitle className="flex items-center justify-between">
								<span className="text-lg font-bold">{event.title}</span>
								{canEdit && (
									<motion.div
										initial={{ opacity: 0, x: -10 }}
										whileHover={{ opacity: 1, x: 0 }}
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();
										}}
										className="flex items-center gap-2"
									>
										<EventEditButton event={event} />
										<EventDeleteButton event={event} />
									</motion.div>
								)}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground font-medium">
								{format(eventDate, "d MMMM yyyy", { locale: nl })}
							</p>
							{event.location && (
								<p className="text-sm text-muted-foreground mt-1">
									{event.location}
								</p>
							)}
						</CardContent>
					</Card>
				</motion.div>
			</Link>
		</motion.div>
	);
}


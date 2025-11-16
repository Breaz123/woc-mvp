"use client";

import { motion } from "framer-motion";
import { staggerContainer } from "@/lib/animations";
import { cn } from "@/lib/utils";

interface StaggerContainerProps {
	children: React.ReactNode;
	className?: string;
}

export function StaggerContainer({ children, className }: StaggerContainerProps) {
	return (
		<motion.div
			variants={staggerContainer}
			initial="initial"
			animate="animate"
			transition={{
				duration: 0.4,
				ease: [0.16, 1, 0.3, 1],
			}}
			className={cn("", className)}
		>
			{children}
		</motion.div>
	);
}


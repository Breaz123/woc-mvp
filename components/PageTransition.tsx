"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations";

export function PageTransition({ children }: { children: React.ReactNode }) {
	return (
		<motion.div
			initial="initial"
			animate="animate"
			variants={fadeInUp}
			transition={{
				duration: 0.5,
				ease: [0.16, 1, 0.3, 1],
			}}
			className="w-full"
		>
			{children}
		</motion.div>
	);
}


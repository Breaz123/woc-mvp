"use client";

import Link from "next/link";
import { useState } from "react";

interface SponsorLogoProps {
	logoUrl: string;
	name: string;
	websiteUrl?: string;
}

export function SponsorLogo({ logoUrl, name, websiteUrl }: SponsorLogoProps) {
	const [hasError, setHasError] = useState(false);

	if (hasError) {
		return null;
	}

	const img = (
		<img
			src={logoUrl}
			alt={name}
			className="max-h-24 max-w-full object-contain"
			onError={() => setHasError(true)}
		/>
	);

	if (websiteUrl) {
		return (
			<div className="mb-4 flex justify-center">
				<Link
					href={websiteUrl}
					target="_blank"
					rel="noopener noreferrer"
				>
					{img}
				</Link>
			</div>
		);
	}

	return <div className="mb-4 flex justify-center">{img}</div>;
}


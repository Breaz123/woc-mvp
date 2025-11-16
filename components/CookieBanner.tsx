"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { X } from "lucide-react";

const COOKIE_CONSENT_KEY = "woc-cookie-consent";

export function CookieBanner() {
	const [showBanner, setShowBanner] = useState(false);

	useEffect(() => {
		// Check if user has already given consent
		const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
		if (!consent) {
			// Show banner after a short delay for better UX
			const timer = setTimeout(() => {
				setShowBanner(true);
			}, 500);
			return () => clearTimeout(timer);
		}
	}, []);

	const handleAccept = () => {
		localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
			accepted: true,
			date: new Date().toISOString(),
		}));
		setShowBanner(false);
	};

	const handleDecline = () => {
		localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
			accepted: false,
			date: new Date().toISOString(),
		}));
		setShowBanner(false);
	};

	if (!showBanner) {
		return null;
	}

	return (
		<div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
			<Card className="mx-auto max-w-4xl shadow-lg border-2">
				<CardHeader className="pb-3">
					<div className="flex items-start justify-between">
						<div className="flex-1">
							<CardTitle className="text-lg md:text-xl">Cookie toestemming</CardTitle>
							<CardDescription className="mt-1">
								We gebruiken cookies om uw ervaring te verbeteren en essentiële functionaliteit te bieden.
							</CardDescription>
						</div>
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6"
							onClick={handleDecline}
							aria-label="Sluiten"
						>
							<X className="h-4 w-4" />
						</Button>
					</div>
				</CardHeader>
				<CardContent className="pt-0">
					<p className="text-sm text-muted-foreground">
						We gebruiken essentiële cookies voor authenticatie en beveiliging. Door op {`"`}Accepteren{`"`} te klikken,
						gaat u akkoord met ons{" "}
						<Link href="/privacy" className="text-primary hover:underline">
							cookiebeleid
						</Link>
						.
					</p>
				</CardContent>
				<CardFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end pt-2">
					<Button variant="outline" onClick={handleDecline} className="w-full sm:w-auto">
						Weigeren
					</Button>
					<Button onClick={handleAccept} className="w-full sm:w-auto">
						Accepteren
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}

// Helper function to check if user has given consent
export function hasCookieConsent(): boolean {
	if (typeof window === "undefined") return false;
	const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
	if (!consent) return false;
	try {
		const parsed = JSON.parse(consent);
		return parsed.accepted === true;
	} catch {
		return false;
	}
}


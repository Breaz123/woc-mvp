"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, Facebook, Users, HandHeart } from "lucide-react";

// Contact informatie - kan later vanuit database/config komen
const CONTACT_INFO = {
	email: "oudercomite@klavernest.be", // Vervang met echt e-mailadres
	phone: "+32 XXX XX XX XX", // Vervang met echt telefoonnummer
	address: "'t Klavernest, Wechelderzande", // Vervang met echt adres
	facebook: "https://www.facebook.com/wechelsoudercomite", // Vervang met echte Facebook URL
};

export function ContactButtons() {
	const handleEmailClick = () => {
		window.location.href = `mailto:${CONTACT_INFO.email}?subject=Contact via WOC Website`;
	};

	const handlePhoneClick = () => {
		window.location.href = `tel:${CONTACT_INFO.phone.replace(/\s/g, "")}`;
	};

	const handleFacebookClick = () => {
		window.open(CONTACT_INFO.facebook, "_blank", "noopener,noreferrer");
	};

	return (
		<div className="space-y-6 pt-6 border-t">
			<div>
				<h3 className="text-xl font-semibold mb-4">Snelle contactopties</h3>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					<Card className="hover:shadow-md transition-shadow">
						<CardHeader className="pb-3">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-primary/10 rounded-lg">
									<Mail className="h-5 w-5 text-primary" />
								</div>
								<CardTitle className="text-base">E-mail</CardTitle>
							</div>
							<CardDescription className="text-xs mt-1">
								Stuur ons een bericht
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Button
								onClick={handleEmailClick}
								className="w-full"
								variant="outline"
								size="sm"
							>
								<Mail className="h-4 w-4 mr-2" />
								E-mail versturen
							</Button>
							<p className="text-xs text-muted-foreground mt-2 break-all">
								{CONTACT_INFO.email}
							</p>
						</CardContent>
					</Card>

					<Card className="hover:shadow-md transition-shadow">
						<CardHeader className="pb-3">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-primary/10 rounded-lg">
									<Phone className="h-5 w-5 text-primary" />
								</div>
								<CardTitle className="text-base">Telefoon</CardTitle>
							</div>
							<CardDescription className="text-xs mt-1">
								Bel ons direct
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Button
								onClick={handlePhoneClick}
								className="w-full"
								variant="outline"
								size="sm"
							>
								<Phone className="h-4 w-4 mr-2" />
								Bellen
							</Button>
							<p className="text-xs text-muted-foreground mt-2">
								{CONTACT_INFO.phone}
							</p>
						</CardContent>
					</Card>

					<Card className="hover:shadow-md transition-shadow">
						<CardHeader className="pb-3">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-primary/10 rounded-lg">
									<Facebook className="h-5 w-5 text-primary" />
								</div>
								<CardTitle className="text-base">Facebook</CardTitle>
							</div>
							<CardDescription className="text-xs mt-1">
								Volg ons op sociale media
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Button
								onClick={handleFacebookClick}
								className="w-full"
								variant="outline"
								size="sm"
							>
								<Facebook className="h-4 w-4 mr-2" />
								Bekijk Facebook
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>

			<div>
				<h3 className="text-xl font-semibold mb-4">Informatie</h3>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<Card>
						<CardHeader className="pb-3">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-primary/10 rounded-lg">
									<MapPin className="h-5 w-5 text-primary" />
								</div>
								<CardTitle className="text-base">Adres</CardTitle>
							</div>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground">
								{CONTACT_INFO.address}
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="pb-3">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-primary/10 rounded-lg">
									<Users className="h-5 w-5 text-primary" />
								</div>
								<CardTitle className="text-base">Lid worden?</CardTitle>
							</div>
							<CardDescription className="text-xs mt-1">
								Word actief lid van het oudercomité
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Button
								onClick={handleEmailClick}
								className="w-full"
								variant="outline"
								size="sm"
							>
								<Users className="h-4 w-4 mr-2" />
								Neem contact op
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>

			<div>
				<Card className="bg-primary/5 border-primary/20">
					<CardHeader>
						<div className="flex items-center gap-3">
							<div className="p-2 bg-primary/20 rounded-lg">
								<HandHeart className="h-5 w-5 text-primary" />
							</div>
							<CardTitle className="text-base">Helpende hand gezocht?</CardTitle>
						</div>
						<CardDescription className="text-xs mt-1">
							Geen tijd voor vergaderingen, maar wel zin om af en toe te helpen?
						</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground mb-3">
							Schrijf je in als helpende hand om onze activiteiten mee te ondersteunen en in goede banen te leiden.
						</p>
						<Button
							onClick={handleEmailClick}
							className="w-full sm:w-auto"
							size="sm"
						>
							<HandHeart className="h-4 w-4 mr-2" />
							Meld je aan als helpende hand
						</Button>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}


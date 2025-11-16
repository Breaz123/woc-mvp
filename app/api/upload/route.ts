import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { Role } from "@/lib/types";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
	try {
		await requireRole([Role.Admin, Role.Kernlid]);
		const supabase = createSupabaseServer();

		const formData = await request.formData();
		const file = formData.get("file") as File;

		if (!file) {
			return NextResponse.json(
				{ error: "Geen bestand geüpload" },
				{ status: 400 }
			);
		}

		// Validate file type
		const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
		if (!validTypes.includes(file.type)) {
			return NextResponse.json(
				{ error: "Alleen JPEG, PNG en WebP afbeeldingen zijn toegestaan" },
				{ status: 400 }
			);
		}

		// Validate file size (max 5MB)
		const maxSize = 5 * 1024 * 1024; // 5MB
		if (file.size > maxSize) {
			return NextResponse.json(
				{ error: "Bestand is te groot. Maximum 5MB toegestaan" },
				{ status: 400 }
			);
		}

		// Generate unique filename
		const fileExt = file.name.split(".").pop();
		const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
		
		// Check upload type
		const uploadType = formData.get("type") as string;
		const filePath = uploadType === "sponsor" 
			? `sponsors/${fileName}` 
			: uploadType === "news"
			? `news/${fileName}`
			: `events/${fileName}`;

		// Convert File to ArrayBuffer
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Upload to Supabase Storage
		const bucketName = uploadType === "sponsor" ? "event-images" : "event-images";
		const { data, error } = await supabase.storage
			.from(bucketName)
			.upload(filePath, buffer, {
				contentType: file.type,
				upsert: false,
			});

		if (error) {
			console.error("Storage upload error:", error);
			return NextResponse.json(
				{ error: error.message || "Fout bij uploaden van afbeelding" },
				{ status: 500 }
			);
		}

		// Get public URL
		const {
			data: { publicUrl },
		} = supabase.storage.from(bucketName).getPublicUrl(filePath);

		return NextResponse.json({ url: publicUrl });
	} catch (error: any) {
		console.error("Upload error:", error);
		return NextResponse.json(
			{ error: error.message || "Serverfout bij uploaden" },
			{ status: 500 }
		);
	}
}


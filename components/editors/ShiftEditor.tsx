"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Shift } from "@/lib/types";
import { toast } from "sonner";

interface ShiftEditorProps {
	shift?: Shift;
	eventId: string;
	onSave: (data: {
		title: string;
		description?: string;
		start_time: string;
		end_time: string;
		max_slots: number;
	}) => Promise<void>;
	onCancel?: () => void;
}

export function ShiftEditor({
	shift,
	eventId,
	onSave,
	onCancel,
}: ShiftEditorProps) {
	const [title, setTitle] = useState(shift?.title || "");
	const [description, setDescription] = useState(shift?.description || "");
	const [startTime, setStartTime] = useState(
		shift?.start_time
			? new Date(shift.start_time).toISOString().slice(0, 16)
			: ""
	);
	const [endTime, setEndTime] = useState(
		shift?.end_time
			? new Date(shift.end_time).toISOString().slice(0, 16)
			: ""
	);
	const [maxSlots, setMaxSlots] = useState(
		shift?.max_slots?.toString() || "1"
	);
	const [isSaving, setIsSaving] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim()) {
			toast.error("Titel is verplicht");
			return;
		}
		if (!startTime) {
			toast.error("Starttijd is verplicht");
			return;
		}
		if (!endTime) {
			toast.error("Eindtijd is verplicht");
			return;
		}
		const maxSlotsNum = parseInt(maxSlots, 10);
		if (isNaN(maxSlotsNum) || maxSlotsNum < 1) {
			toast.error("Max slots moet minimaal 1 zijn");
			return;
		}

		const startDate = new Date(startTime);
		const endDate = new Date(endTime);
		if (endDate <= startDate) {
			toast.error("Eindtijd moet na starttijd zijn");
			return;
		}

		setIsSaving(true);
		try {
			await onSave({
				title: title.trim(),
				description: description.trim() || undefined,
				start_time: startDate.toISOString(),
				end_time: endDate.toISOString(),
				max_slots: maxSlotsNum,
			});
		} catch (error) {
			// Error is already handled in parent
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div>
				<label htmlFor="title" className="block text-sm font-medium mb-2">
					Titel *
				</label>
				<Input
					id="title"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					required
				/>
			</div>
			<div>
				<label htmlFor="start_time" className="block text-sm font-medium mb-2">
					Starttijd *
				</label>
				<Input
					id="start_time"
					type="datetime-local"
					value={startTime}
					onChange={(e) => setStartTime(e.target.value)}
					required
				/>
			</div>
			<div>
				<label htmlFor="end_time" className="block text-sm font-medium mb-2">
					Eindtijd *
				</label>
				<Input
					id="end_time"
					type="datetime-local"
					value={endTime}
					onChange={(e) => setEndTime(e.target.value)}
					required
				/>
			</div>
			<div>
				<label htmlFor="max_slots" className="block text-sm font-medium mb-2">
					Maximaal aantal plaatsen *
				</label>
				<Input
					id="max_slots"
					type="number"
					min="1"
					value={maxSlots}
					onChange={(e) => setMaxSlots(e.target.value)}
					required
				/>
			</div>
			<div>
				<label
					htmlFor="description"
					className="block text-sm font-medium mb-2"
				>
					Beschrijving
				</label>
				<Textarea
					id="description"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					rows={4}
				/>
			</div>
			<div className="flex gap-2">
				<Button type="submit" disabled={isSaving}>
					{isSaving ? "Opslaan..." : "Opslaan"}
				</Button>
				{onCancel && (
					<Button type="button" variant="outline" onClick={onCancel}>
						Annuleren
					</Button>
				)}
			</div>
		</form>
	);
}


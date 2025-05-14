import { randomUUID } from "crypto";
import { ChoreQueries } from "./queries.ts";

export const calculateNextDueDate = (
	frequency: string,
	baseDate: number = Date.now()
): number => {
	const date = new Date(baseDate);

	switch (frequency) {
		case "weekly":
			date.setDate(date.getDate() + 7);
			break;
		case "monthly":
			date.setMonth(date.getMonth() + 1);
			break;
		case "quarterly":
			date.setMonth(date.getMonth() + 3);
			break;
		default:
			throw new Error(`Invalid frequency: ${frequency}`);
	}

	return date.getTime();
};

export const completeChore = (
	choreId: string,
	userId: string,
	choreQueries: ChoreQueries
) => {
	const chore = choreQueries.getById(choreId);

	if (!chore) return { success: false, error: "Chore not found" };

	// Record the completion
	const completionId = randomUUID();
	const now = Date.now();

	const completion = choreQueries.complete(completionId, choreId, userId, now);

	if (!completion)
		return { success: false, error: "Failed to record completion" };

	// Calculate the next due date based on frequency
	const nextDueDate = calculateNextDueDate(chore.frequency as string);

	// Update the chore with the new due date
	const updatedChore = choreQueries.updateNextDueDate(nextDueDate, choreId);

	if (!updatedChore)
		return { success: false, error: "Failed to update due date" };

	return {
		success: true,
		chore: updatedChore,
	};
};

export const reserveChore = (
	choreId: string,
	userId: string,
	choreQueries: ChoreQueries
) => {
	// Set reservation timeout (24 hours from now)
	const reservationExpiry = Date.now() + 24 * 60 * 60 * 1000;

	// Try to reserve the chore if it's not already reserved
	const chore = choreQueries.reserve(userId, reservationExpiry, choreId);

	if (!chore) {
		// Get info about current reservation
		const currentReservation = choreQueries.getById(choreId);

		// If reservation exists but has expired, we can force update
		if (currentReservation && currentReservation.reserved_until! < Date.now()) {
			const updatedChore = choreQueries.updateReservation(
				userId,
				reservationExpiry,
				choreId
			);
			return { success: true, chore: updatedChore };
		}

		return {
			success: false,
			error: "Chore is already reserved",
			reservedBy: currentReservation?.reserved_by,
			reserved_until: currentReservation?.reserved_until,
		};
	}

	return { success: true, chore };
};

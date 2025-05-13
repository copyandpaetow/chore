import { randomUUID } from "crypto";
import {
	addChoreCompletion,
	createChore,
	deleteChore,
	getChoreById,
	getChoreCompletions,
	getChoresByUserId,
	reserveUnreservedChore,
	updateChoreNextDueDate,
	updateChoreReservation,
} from "./db.ts";

export type Difficulty = 1 | 2 | 3 | 4 | 5;

export type Chore = {
	id: string;
	title: string;
	description: string;
	createdAt: string;
	frequency: string;
	nextDueDate: string;
	difficulty: Difficulty;
	reservedBy: string | null;
	reservedUntil: string | null;
	isPrivate: boolean;
};

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

export const createNewChore = (
	title: string,
	userId: string,
	frequency: string,
	description: string = "",
	difficulty: Difficulty = 3,
	isPrivate: boolean = false,
	firstDueDate?: string
): Chore | null => {
	const choreId = randomUUID();
	const now = Date.now();
	const nextDueDate = firstDueDate
		? new Date(firstDueDate).getTime()
		: calculateNextDueDate(frequency);

	console.log({
		choreId,
		title,
		description,
		now,
		frequency,
		userId,
		nextDueDate,
		difficulty,
		isPrivate,
	});

	const newChore = createChore.get(
		choreId,
		title,
		description,
		now,
		frequency,
		userId,
		nextDueDate,
		difficulty,
		isPrivate ? 1 : 0
	);

	if (!newChore) return null;

	return {
		id: newChore.id,
		title: newChore.title,
		description: newChore.description,
		createdAt: new Date(newChore.created_at as number).toISOString(),
		frequency: newChore.frequency,
		nextDueDate: new Date(newChore.next_due_date as number).toISOString(),
		difficulty: newChore.difficulty,
		reservedBy: null,
		reservedUntil: null,
		isPrivate: newChore.is_private === 1,
	};
};

export const getUserChores = (userId: string): Array<Chore> => {
	const chores = getChoresByUserId.all(userId);

	if (!chores || chores.length === 0) return [];

	return chores.map((chore) => ({
		id: chore.id,
		title: chore.title,
		description: chore.description,
		createdAt: new Date(chore.created_at as number).toISOString(),
		frequency: chore.frequency,
		nextDueDate: new Date(chore.next_due_date as number).toISOString(),
		difficulty: chore.difficulty,
		reservedBy: chore.reserved_by,
		reservedUntil: chore.reserved_until,
		isPrivate: chore.is_private === 1,
	}));
};

export const completeChore = (choreId: string, userId: string) => {
	const chore = getChoreById.get(choreId);

	if (!chore) return { success: false, error: "Chore not found" };

	// Record the completion
	const completionId = randomUUID();
	const now = Date.now();

	const completion = addChoreCompletion.get(completionId, choreId, userId, now);

	if (!completion)
		return { success: false, error: "Failed to record completion" };

	// Calculate the next due date based on frequency
	const nextDueDate = calculateNextDueDate(chore.frequency as string);

	// Update the chore with the new due date
	const updatedChore = updateChoreNextDueDate.get(nextDueDate, choreId);

	if (!updatedChore)
		return { success: false, error: "Failed to update due date" };

	return {
		success: true,
		chore: {
			id: updatedChore.id,
			title: updatedChore.title,
			description: updatedChore.description,
			createdAt: new Date(updatedChore.created_at as number).toISOString(),
			frequency: updatedChore.frequency,
			nextDueDate: new Date(updatedChore.next_due_date as number).toISOString(),
		},
	};
};

// Get completion history for all chores of a user
export const getChoreHistory = (userId: string) => {
	const completions = getChoreCompletions.all(userId);

	if (!completions || completions.length === 0) return [];

	return completions.map((completion) => ({
		id: completion.id,
		choreId: completion.chore_id,
		choreTitle: completion.title,
		frequency: completion.frequency,
		completedBy: completion.completed_by,
		completedAt: new Date(completion.completed_at as number).toISOString(),
	}));
};

// Delete a chore
export const removeChore = (choreId: string, userId: string) => {
	deleteChore.run(choreId, userId);
	return { success: true };
};

export const reserveChore = (choreId: string, userId: string) => {
	// Set reservation timeout (24 hours from now)
	const reservationExpiry = Date.now() + 24 * 60 * 60 * 1000;

	// Try to reserve the chore if it's not already reserved
	const result = reserveUnreservedChore.get(userId, reservationExpiry, choreId);

	if (!result) {
		// Get info about current reservation
		const currentReservation = getChoreById.get(choreId);

		// If reservation exists but has expired, we can force update
		if (currentReservation && currentReservation.reserved_until < Date.now()) {
			updateChoreReservation.run(userId, reservationExpiry, choreId);
			return { success: true };
		}

		return {
			success: false,
			error: "Chore is already reserved",
			reservedBy: currentReservation.reserved_by,
			reservedUntil: new Date(currentReservation.reserved_until).toISOString(),
		};
	}

	return { success: true };
};

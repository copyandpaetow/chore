import { DatabaseSync } from "node:sqlite";
import {
	type Difficulty,
	type Frequency,
	type Chore,
	type ChoreCompletion,
} from "../db/chore.ts";

export type ChoreCompletionQueries = {
	complete(
		id: string,
		chore_id: string,
		completed_by: string,
		completed_at: number
	): ChoreCompletion | undefined;
	getAllCompletions(userId: string): ChoreCompletion[] | undefined;
	getAllCompletionsByChoreId(choreId: string): ChoreCompletion[] | undefined;
};

const createChoreCompletionQueries = (
	database: DatabaseSync
): ChoreCompletionQueries => {
	const addChoreCompletion = database.prepare(`
    INSERT INTO chore_completion (id, chore_id, completed_by, completed_at)
    VALUES (?, ?, ?, ?)
    RETURNING id, chore_id, completed_by, completed_at
  `);

	const getChoreCompletions = database.prepare(`
    SELECT cc.*, c.title, c.frequency 
    FROM chore_completion cc
    INNER JOIN chore c ON c.id = cc.chore_id
    WHERE c.owner_id = ?
    ORDER BY completed_at DESC
  `);

	const getChoreCompletionsByChoreId = database.prepare(`
    SELECT * FROM chore_completion 
    WHERE chore_id = ?
    ORDER BY completed_at DESC
  `);

	return {
		complete(
			id: string,
			chore_id: string,
			completed_by: string,
			completed_at: number
		) {
			if (!id || !chore_id || !completed_by) {
				throw new Error("Missing required fields for chore completion");
			}

			try {
				return addChoreCompletion.get(
					id,
					chore_id,
					completed_by,
					completed_at
				) as ChoreCompletion | undefined;
			} catch (error) {
				console.error("Database error:", error);
				throw new Error("Failed to create chore completion");
			}
		},
		getAllCompletions(userId: string) {
			if (!userId) {
				throw new Error("User ID is required to get completions");
			}

			try {
				return getChoreCompletions.all(userId) as
					| Array<ChoreCompletion>
					| undefined;
			} catch (error) {
				console.error("Database error:", error);
				throw new Error("Failed to get chore completions");
			}
		},
		getAllCompletionsByChoreId(choreId: string) {
			if (!choreId) {
				throw new Error("Chore ID is required to get completions");
			}

			try {
				return getChoreCompletionsByChoreId.all(choreId) as
					| Array<ChoreCompletion>
					| undefined;
			} catch (error) {
				console.error("Database error:", error);
				throw new Error("Failed to get chore completions by chore ID");
			}
		},
	};
};

export type ChoreQueries = {
	create(
		id: string,
		title: string,
		description: string,
		created_at: number,
		frequency: Frequency,
		owner_id: string,
		next_due_date: number,
		difficulty: Difficulty,
		is_private: 0 | 1
	): Chore | undefined;
	getById(id: string): Chore | undefined;
	getAllByUserId(userId: string): Chore[];
	updateNextDueDate(nextDueDate: number, id: string): Chore | undefined;
	delete(id: string, ownerId: string): void;
	reserve(
		reservedBy: string,
		reservedUntil: number,
		id: string
	): Chore | undefined;
	releaseReservation(reservedBy: string, id: string): Chore | undefined;
	updateReservation(
		reservedBy: string,
		reservedUntil: number,
		id: string
	): Chore | undefined;
} & ChoreCompletionQueries;

export const createChoreQueries = (database: DatabaseSync): ChoreQueries => {
	const createChore = database.prepare(`
    INSERT INTO chore (id, title, description, created_at, frequency, owner_id, next_due_date, difficulty, is_private)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    RETURNING id, title, description, created_at, frequency, owner_id, next_due_date, difficulty, is_private, reserved_by, reserved_until
  `);

	const getChoresByUserId = database.prepare(`
    SELECT * FROM chore 
    WHERE is_private = FALSE
       OR (is_private = TRUE AND owner_id = ?)
    ORDER BY next_due_date ASC
  `);

	const getChoreById = database.prepare(`
    SELECT * FROM chore WHERE id = ?
  `);

	const updateChoreNextDueDate = database.prepare(`
    UPDATE chore SET next_due_date = ? WHERE id = ?
    RETURNING id, title, description, created_at, frequency, owner_id, next_due_date, difficulty, is_private, reserved_by, reserved_until
  `);

	const deleteChore = database.prepare(`
    DELETE FROM chore WHERE id = ? AND owner_id = ?
  `);

	const reserveUnreservedChore = database.prepare(`
    UPDATE chore 
    SET reserved_by = ?, reserved_until = ? 
    WHERE id = ? AND reserved_by IS NULL
    RETURNING id, title, description, created_at, frequency, owner_id, next_due_date, difficulty, is_private, reserved_by, reserved_until
  `);

	const releaseReservedChore = database.prepare(`
    UPDATE chore 
    SET reserved_by = null, reserved_until = null 
    WHERE reserved_by = ? AND id = ?
    RETURNING id, title, description, created_at, frequency, owner_id, next_due_date, difficulty, is_private, reserved_by, reserved_until
  `);

	const updateChoreReservation = database.prepare(`
    UPDATE chore 
    SET reserved_by = ?, reserved_until = ? 
    WHERE id = ?
    RETURNING id, title, description, created_at, frequency, owner_id, next_due_date, difficulty, is_private, reserved_by, reserved_until
  `);

	return {
		create(
			id: string,
			title: string,
			description: string,
			created_at: number,
			frequency: Frequency,
			owner_id: string,
			next_due_date: number,
			difficulty: Difficulty,
			is_private: 0 | 1
		) {
			if (!id || !title || !owner_id) {
				throw new Error(
					"ID, title and owner ID are required for chore creation"
				);
			}

			try {
				return createChore.get(
					id,
					title,
					description,
					created_at,
					frequency,
					owner_id,
					next_due_date,
					difficulty,
					is_private
				) as Chore | undefined;
			} catch (error) {
				console.error("Database error:", error);
				throw new Error("Failed to create chore");
			}
		},
		getById(id: string) {
			if (!id) {
				throw new Error("Chore ID is required");
			}

			try {
				return getChoreById.get(id) as Chore | undefined;
			} catch (error) {
				console.error("Database error:", error);
				throw new Error("Failed to get chore by ID");
			}
		},
		getAllByUserId(userId: string) {
			if (!userId) {
				throw new Error("User ID is required to get chores");
			}

			try {
				return (getChoresByUserId.all(userId) ?? []) as Array<Chore>;
			} catch (error) {
				console.error("Database error:", error);
				throw new Error("Failed to get chores by user ID");
			}
		},
		updateNextDueDate(nextDueDate: number, id: string) {
			if (!id) {
				throw new Error("Chore ID is required for updating due date");
			}

			try {
				return updateChoreNextDueDate.get(nextDueDate, id) as Chore | undefined;
			} catch (error) {
				console.error("Database error:", error);
				throw new Error("Failed to update chore due date");
			}
		},
		delete(id: string, ownerId: string) {
			if (!id || !ownerId) {
				throw new Error("Chore ID and owner ID are required for deletion");
			}

			try {
				deleteChore.run(id, ownerId);
			} catch (error) {
				console.error("Database error:", error);
				throw new Error("Failed to delete chore");
			}
		},
		reserve(reservedBy: string, reservedUntil: number, id: string) {
			if (!id || !reservedBy) {
				throw new Error("Chore ID and user ID are required for reservation");
			}

			try {
				return reserveUnreservedChore.get(reservedBy, reservedUntil, id) as
					| Chore
					| undefined;
			} catch (error) {
				console.error("Database error:", error);
				throw new Error("Failed to reserve chore");
			}
		},
		releaseReservation(reservedBy: string, id: string) {
			if (!id || !reservedBy) {
				throw new Error(
					"Chore ID and user ID are required to release reservation"
				);
			}

			try {
				return releaseReservedChore.get(reservedBy, id) as Chore | undefined;
			} catch (error) {
				console.error("Database error:", error);
				throw new Error("Failed to release chore reservation");
			}
		},
		updateReservation(reservedBy: string, reservedUntil: number, id: string) {
			if (!id || !reservedBy) {
				throw new Error(
					"Chore ID and user ID are required to update reservation"
				);
			}

			try {
				return updateChoreReservation.get(reservedBy, reservedUntil, id) as
					| Chore
					| undefined;
			} catch (error) {
				console.error("Database error:", error);
				throw new Error("Failed to update chore reservation");
			}
		},
		...createChoreCompletionQueries(database),
	};
};

import { randomUUID } from "crypto";
import { type Request, type Response } from "express";
import { getCurrentUser } from "../user/helper.ts";
import { type ChoreQueries } from "./queries.ts";
import { calculateNextDueDate } from "./complete.ts";

export const createChore =
	(choreQueries: ChoreQueries) => async (req: Request, res: Response) => {
		try {
			const { title, frequency } = req.body;

			if (!title || !frequency) {
				throw new Error("error: Missing required properties");
			}

			if (!["weekly", "monthly", "quarterly"].includes(frequency)) {
				throw new Error(
					"Invalid frequency. Must be weekly, monthly, or quarterly"
				);
			}

			const {
				description = "",
				difficulty = 3,
				isPrivate = 0,
				firstDueDate,
			} = req.body;

			const user = getCurrentUser(req)!;
			const choreId = randomUUID();
			const createdAt = Date.now();
			const nextDueDate = firstDueDate
				? new Date(firstDueDate).getTime()
				: calculateNextDueDate(frequency);

			const chore = choreQueries.create(
				choreId,
				title,
				description,
				createdAt,
				frequency,
				user.id,
				nextDueDate,
				difficulty,
				isPrivate
			);

			if (!chore) {
				res.status(500).json({ error: "Failed to create chore" });
				return;
			}
			res.redirect("/");
		} catch (error) {
			res.status(401).json({
				success: false,
				error,
			});
		}
	};

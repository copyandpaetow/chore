import { randomUUID } from "crypto";
import { sendNotificationToUsers } from "../push/notify-client.ts";
import { getCurrentUser } from "../user/helper.ts";
import { type ChoreQueries } from "./queries.ts";
import { type Request, type Response } from "express";
import { type PushQueries } from "../push/queries.ts";

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

export const completeChore =
	(choreQueries: ChoreQueries, pushQueries: PushQueries) =>
	async (req: Request, res: Response) => {
		try {
			const choreId = req.params.id;
			const user = getCurrentUser(req)!;
			const chore = choreQueries.getById(choreId);

			if (!chore) {
				throw new Error("chore doesnt exist");
			}

			const completionId = randomUUID();
			const now = Date.now();

			const completion = choreQueries.complete(
				completionId,
				choreId,
				user.id,
				now
			);

			if (!completion) {
				throw new Error("Failed to record completion");
			}

			const nextDueDate = calculateNextDueDate(chore.frequency as string);
			const updatedChore = choreQueries.updateNextDueDate(nextDueDate, choreId);

			if (!updatedChore) {
				throw new Error("Failed to update due date");
			}

			const notifyUserIds = [chore.owner_id];

			await sendNotificationToUsers(
				notifyUserIds,
				{
					type: "CHORE_COMPLETED",
					choreId: chore.id,
					title: chore.title,
					completedBy: user.id,
					nextDueDate: chore.next_due_date,
					timestamp: Date.now(),
				},
				user.id,
				pushQueries
			);

			res.json({
				success: true,
				chore,
			});
		} catch (error) {
			res.status(401).json({
				success: false,
				error,
			});
		}
	};

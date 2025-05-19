import express from "express";
import { calculateNextDueDate, completeChore, reserveChore } from "./chores.ts";
import { getCurrentUser } from "../user/helper.ts";
import { type ChoreQueries } from "./queries.ts";
import { randomUUID } from "crypto";
import { renderChores } from "../../pages/home/transformer.ts";
import { renderPage } from "../renderer/renderer.ts";

export const createChoreRouter = (
	choreQueries: ChoreQueries,
	requireAuth: (
		req: express.Request,
		res: express.Response,
		nextFunction: express.NextFunction
	) => Promise<void>
) => {
	const choreRouter = express.Router();

	choreRouter.get(
		"/",
		requireAuth,
		async (req: express.Request, res: express.Response) => {
			const user = getCurrentUser(req)!;
			const chores = choreQueries.getAllByUserId(user.id);
			const template = await renderPage(
				"src/pages/home/index.html",
				(template) => renderChores(template, chores)
			);

			console.log(template);
			res.send(template);
		}
	);

	choreRouter.post(
		"/create",
		requireAuth,
		(req: express.Request, res: express.Response) => {
			const { title, frequency } = req.body;

			if (!title || !frequency) {
				return res.status(400).json({ error: "Missing required properties" });
			}

			if (!["weekly", "monthly", "quarterly"].includes(frequency)) {
				return res.status(400).json({
					error: "Invalid frequency. Must be weekly, monthly, or quarterly",
				});
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
				return res.status(500).json({ error: "Failed to create chore" });
			}

			res.json({
				success: true,
				chore,
			});
		}
	);

	choreRouter.post(
		"/:id/complete",
		requireAuth,
		(req: express.Request, res: express.Response) => {
			const choreId = req.params.id;
			const user = getCurrentUser(req)!;

			const result = completeChore(choreId, user.id, choreQueries);

			if (!result.success) {
				return res.status(400).json({ error: result.error });
			}

			res.json({
				success: true,
				chore: result.chore,
			});
		}
	);

	choreRouter.delete(
		"/:id",
		requireAuth,
		(req: express.Request, res: express.Response) => {
			const choreId = req.params.id;
			const user = getCurrentUser(req)!;

			choreQueries.delete(choreId, user.id);

			res.json({ success: true });
		}
	);

	choreRouter.post(
		"/:id/reserve",
		requireAuth,
		(req: express.Request, res: express.Response) => {
			const choreId = req.params.id;
			const user = getCurrentUser(req)!;

			const result = reserveChore(choreId, user.id, choreQueries);

			if (!result.success) {
				return res.status(400).json({ error: result.error });
			}

			res.json({
				success: true,
				chore: result.chore,
			});
		}
	);

	return choreRouter;
};

import express from "express";
import { getCurrentUser, requireAuth } from "../auth/middleware.ts";
import {
	completeChore,
	createNewChore,
	getChoreHistory,
	getUserChores,
	removeChore,
	reserveChore,
} from "./chores.ts";

export const choreRouter = express.Router();

choreRouter.get(
	"/chores",
	requireAuth,
	(req: express.Request, res: express.Response) => {
		const user = getCurrentUser(req);
		const chores = getUserChores(user.id);

		res.json({
			success: true,
			chores,
		});
	}
);

// Create a new chore
choreRouter.post(
	"/chore",
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
			isPrivate = false,
			firstDueDate,
		} = req.body;

		const user = getCurrentUser(req);
		const chore = createNewChore(
			title,
			user.id,
			frequency,
			description,
			difficulty,
			isPrivate,
			firstDueDate
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

// Mark a chore as complete
choreRouter.post(
	"/:id/complete",
	requireAuth,
	(req: express.Request, res: express.Response) => {
		const choreId = req.params.id;
		const user = getCurrentUser(req);

		const result = completeChore(choreId, user.id);

		if (!result.success) {
			return res.status(400).json({ error: result.error });
		}

		res.json({
			success: true,
			chore: result.chore,
		});
	}
);

// Delete a chore
choreRouter.delete(
	"/:id",
	requireAuth,
	(req: express.Request, res: express.Response) => {
		const choreId = req.params.id;
		const user = getCurrentUser(req);

		const result = removeChore(choreId, user.id);

		res.json(result);
	}
);

// Mark a chore as complete
choreRouter.post(
	"/:id/reserve",
	requireAuth,
	(req: express.Request, res: express.Response) => {
		const choreId = req.params.id;
		const user = getCurrentUser(req);

		const result = reserveChore(choreId, user.id);

		if (!result.success) {
			return res.status(400).json({ error: result.error });
		}

		res.json({
			success: true,
			chore: result.chore,
		});
	}
);

// Get chore completion history
choreRouter.get(
	"/history",
	requireAuth,
	(req: express.Request, res: express.Response) => {
		const user = getCurrentUser(req);
		const history = getChoreHistory(user.id);

		res.json({
			success: true,
			history,
		});
	}
);

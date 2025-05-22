import { type Request, type Response } from "express";

export const createChore = () => async (req: Request, res: Response) => {
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
};

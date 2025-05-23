import { getCurrentUser } from "../user/helper.ts";
import { type ChoreQueries } from "./queries.ts";
import { type Request, type Response } from "express";

export const deleteChore =
	(choreQueries: ChoreQueries) => async (req: Request, res: Response) => {
		try {
			const choreId = req.params.id;
			const user = getCurrentUser(req)!;

			choreQueries.delete(choreId, user.id);

			res.json({ success: true });
		} catch (error) {
			res.status(401).json({
				success: false,
				error,
			});
		}
	};

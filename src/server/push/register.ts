import { type Request, type Response } from "express";
import { type PushQueries } from "./queries.ts";
import { getCurrentUser } from "../user/helper.ts";

export const registerPush =
	(pushQueries: PushQueries) => async (req: Request, res: Response) => {
		try {
			const user = getCurrentUser(req)!;
			const subscription = req.body;

			if (!subscription || !subscription.endpoint) {
				throw new Error("Invalid subscription object");
			}

			const result = pushQueries.saveSubscription(user.id, subscription);

			res.json({
				success: true,
				subscription: result,
			});
		} catch (error) {
			res.status(400).json({
				success: false,
				error: `Error unregistering push subscription. Reason: ${error}`,
			});
		}
	};

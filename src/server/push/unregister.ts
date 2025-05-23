import { type Request, type Response } from "express";
import { type PushQueries } from "./queries.ts";

export const unregisterPush =
	(pushQueries: PushQueries) => async (req: Request, res: Response) => {
		try {
			const { endpoint } = req.body;

			if (!endpoint) {
				res.status(400).json({ error: "Endpoint is required" });
				return;
			}
			pushQueries.deleteSubscriptionByEndpoint(endpoint);

			res.json({ success: true });
		} catch (error) {
			res.status(500).json({
				success: false,
				error: `Error unregistering push subscription. Reason: ${error}`,
			});
		}
	};

import webpush from "web-push";
import express, { type RequestHandler } from "express";
import { config } from "../../config.ts";
import { type PushQueries } from "./queries.ts";
import { getCurrentUser } from "../user/helper.ts";

webpush.setVapidDetails(
	`mailto:${config.email}`,
	config.webPushPublicKey,
	config.webPushPrivateKey
);

export const createPushRouter = (
	pushQueries: PushQueries,
	requireAuth: (
		req: express.Request,
		res: express.Response,
		nextFunction: express.NextFunction
	) => Promise<void>
) => {
	const pushRouter = express.Router();

	// Endpoint to get public VAPID key
	pushRouter.get(
		"/vapidPublicKey",
		(req: express.Request, res: express.Response) => {
			res.json({ publicKey: config.webPushPublicKey });
		}
	);

	// Endpoint to register a push subscription
	pushRouter.post("/register", requireAuth, ((
		req: express.Request,
		res: express.Response
	) => {
		try {
			const user = getCurrentUser(req)!;
			const subscription = req.body;

			if (!subscription || !subscription.endpoint) {
				return res.status(400).json({ error: "Invalid subscription object" });
			}

			const result = pushQueries.saveSubscription(user.id, subscription);

			res.json({
				success: true,
				subscription: result,
			});
		} catch (error) {
			console.error("Error registering push subscription:", error);
			res.status(500).json({ error: "Failed to register subscription" });
		}
	}) as RequestHandler);

	// Endpoint to unregister a push subscription
	pushRouter.post("/unregister", requireAuth, ((
		req: express.Request,
		res: express.Response
	) => {
		try {
			const { endpoint } = req.body;

			if (!endpoint) {
				return res.status(400).json({ error: "Endpoint is required" });
			}

			pushQueries.deleteSubscriptionByEndpoint(endpoint);

			res.json({
				success: true,
			});
		} catch (error) {
			console.error("Error unregistering push subscription:", error);
			res.status(500).json({ error: "Failed to unregister subscription" });
		}
	}) as RequestHandler);

	return pushRouter;
};

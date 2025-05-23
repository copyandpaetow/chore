import { type Request, type Response } from "express";
import { config } from "../../config.ts";
import webpush from "web-push";

webpush.setVapidDetails(
	`mailto:${config.email}`,
	config.webPushPublicKey,
	config.webPushPrivateKey
);

export const getPublicVapidKey = () => async (req: Request, res: Response) => {
	try {
		const publicKey = config.webPushPublicKey;

		if (!publicKey) {
			throw new Error("no public key available");
		}

		res.json({ success: true, publicKey: config.webPushPublicKey });
	} catch (error) {
		res.status(400).json({
			success: false,
			error: `Error getting public key. Reason: ${error}`,
		});
	}
};

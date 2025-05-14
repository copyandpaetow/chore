// auth.ts - Authentication middleware

import type Express from "express";
import {
	deleteSessionTokenCookie,
	parseCookies,
	setSessionTokenCookie,
} from "./cookies.ts";
import { validateSessionToken } from "./sessions.ts";
import { UserQueries } from "../user/queries.ts";
import { SessionQueries } from "./queries.ts";

export const createAuthMiddleware =
	(userQueries: UserQueries, sessionQueries: SessionQueries) =>
	async (
		req: Express.Request,
		res: Express.Response,
		nextFunction: Express.NextFunction
	): Promise<void> => {
		// CSRF protection for non-GET requests
		// if (req.method !== "GET") {
		// 	const origin = req.headers.origin;
		// 	const allowedOrigins = [
		// 		"http://localhost:8080",
		// 		"http://raspberrypi.local:8080",
		// 	];

		// 	// Add your production domain to allowedOrigins
		// 	if (!origin || !allowedOrigins.includes(origin)) {
		// 		return res.status(403).json({ error: "Invalid origin" });
		// 	}
		// }

		try {
			const cookies = parseCookies(req.headers.cookie || "");
			const token = cookies.get("session");

			if (!token) {
				throw new Error("Unauthorized");
			}

			const result = await validateSessionToken(
				token,
				userQueries,
				sessionQueries
			);

			setSessionTokenCookie(res, token, result.session.expires_at);

			(req as any).user = result.user;
			(req as any).session = result.session;

			nextFunction();
		} catch (error) {
			deleteSessionTokenCookie(res);
			res.status(401).json({ error });
		}
	};

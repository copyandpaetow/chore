// auth.ts - Authentication middleware

import type Express from "express";
import {
	deleteSessionTokenCookie,
	parseCookies,
	setSessionTokenCookie,
} from "./cookies.ts";
import { validateSessionToken } from "./sessions.ts";
import { type UserQueries } from "../user/queries.ts";
import { type SessionQueries } from "./queries.ts";
import { config } from "../config.ts";

export const createAuthMiddleware =
	(userQueries: UserQueries, sessionQueries: SessionQueries) =>
	async (
		req: Express.Request,
		res: Express.Response,
		nextFunction: Express.NextFunction
	): Promise<void> => {
		// CSRF protection for non-GET requests
		if (req.method !== "GET" && config.isProduction) {
			const origin = req.headers.origin;
			const allowedOrigins = [
				"http://localhost:8080",
				"http://raspberrypi.local:8080",
			];

			if (!origin || !allowedOrigins.includes(origin)) {
				res.status(403).json({ error: "Invalid origin" });
			}
		}

		try {
			const cookies = parseCookies(req.headers.cookie || "");
			const token = cookies.get("session");

			if (!token) {
				res.redirect("/login");
				return;
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
			res.redirect("/login");
		}
	};

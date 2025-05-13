// auth.ts - Authentication middleware

import type Express from "express";
import {
	deleteSessionTokenCookie,
	parseCookies,
	setSessionTokenCookie,
} from "./cookies.ts";
import {
	validateSessionToken,
	type SessionValidationResult,
} from "./sessions.ts";

export const requireAuth = async (
	req: Express.Request,
	res: Express.Response,
	nextFunction: Express.NextFunction
) => {
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

	const cookies = parseCookies(req.headers.cookie || "");
	const token = cookies.get("session");

	if (!token) {
		return res.status(401).json({ error: "Unauthorized" });
	}

	const result: SessionValidationResult = await validateSessionToken(token);

	if (result.session === null) {
		deleteSessionTokenCookie(res);
		return res.status(401).json({ error: "Unauthorized" });
	}

	setSessionTokenCookie(res, token, result.session.expires_at);

	(req as any).user = result.user;
	(req as any).session = result.session;

	return nextFunction();
};

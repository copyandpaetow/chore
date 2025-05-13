// auth.ts - Authentication middleware

import type Express from "express";
import { deleteSessionTokenCookie, setSessionTokenCookie } from "./cookies.ts";
import {
	validateSessionToken,
	type SessionValidationResult,
} from "./sessions.ts";

// Parse cookies from Cookie header
const parseCookies = (cookieHeader: string): Map<string, string> => {
	const cookies = new Map<string, string>();
	if (!cookieHeader) return cookies;

	cookieHeader.split(";").forEach((cookie) => {
		const [name, value] = cookie.trim().split("=");
		if (name && value) cookies.set(name, value);
	});

	return cookies;
};

/**
 * Express middleware that validates the session and either:
 * - Continues to the next middleware with req.user and req.session set
 * - Returns 401 Unauthorized if no valid session exists
 */
export const requireAuth = async (
	req: Express.Request,
	res: Express.Response,
	nextFunction: Express.NextFunction
) => {
	// CSRF protection for non-GET requests
	if (req.method !== "GET") {
		const origin = req.headers.origin;
		const allowedOrigins = [
			"http://localhost:8080",
			"http://raspberrypi.local:8080",
		];

		// Add your production domain to allowedOrigins
		if (!origin || !allowedOrigins.includes(origin)) {
			return res.status(403).json({ error: "Invalid origin" });
		}
	}

	// Get session token from cookies
	const cookies = parseCookies(req.headers.cookie || "");
	const token = cookies.get("session");

	if (!token) {
		return res.status(401).json({ error: "Unauthorized" });
	}

	// Validate the session token
	const result: SessionValidationResult = await validateSessionToken(token);

	if (result.session === null) {
		// Invalid or expired session
		deleteSessionTokenCookie(res);
		return res.status(401).json({ error: "Unauthorized" });
	}

	console.log(result);
	// Update the session cookie with the new expiration
	setSessionTokenCookie(res, token, result.session.expiresAt);

	// Add user and session to the request object for use in route handlers
	(req as any).user = result.user;
	(req as any).session = result.session;

	// Continue to the next middleware or route handler
	nextFunction();
};

/**
 * Get the current user from the request, or null if not authenticated
 */
export const getCurrentUser = (req: Request): { id: number } | null => {
	return (req as any).user || null;
};

/**
 * Get the current session from the request, or null if not authenticated
 */
export const getCurrentSession = (
	req: Request
): { id: string; userId: number; expiresAt: Date } | null => {
	return (req as any).session || null;
};

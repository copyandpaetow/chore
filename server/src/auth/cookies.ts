import Express from "express";
import { config } from "../config.ts";

export const setSessionTokenCookie = (
	response: Express.Response,
	token: string,
	expiresAt: Date
): void => {
	if (config.isProduction) {
		response.cookie("session", token, {
			httpOnly: true,
			sameSite: "lax",
			expires: expiresAt,
			path: "/",
			secure: true,
		});
	} else {
		response.cookie("session", token, {
			httpOnly: true,
			sameSite: "lax",
			expires: expiresAt,
			path: "/",
		});
	}
};

export const deleteSessionTokenCookie = (response: Express.Response): void => {
	if (config.isProduction) {
		response.cookie("session", "", {
			httpOnly: true,
			sameSite: "lax",
			maxAge: 0,
			path: "/",
			secure: true,
		});
	} else {
		response.cookie("session", "", {
			httpOnly: true,
			sameSite: "lax",
			maxAge: 0,
			path: "/",
		});
	}
};

export const parseCookies = (cookieHeader: string): Map<string, string> => {
	const cookies = new Map<string, string>();
	if (!cookieHeader) return cookies;

	cookieHeader.split(";").forEach((cookie) => {
		const [name, value] = cookie.trim().split("=");
		if (name && value) cookies.set(name, value);
	});

	return cookies;
};

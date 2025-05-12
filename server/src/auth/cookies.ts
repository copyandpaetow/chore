import Express from "express";

/**
 * Set a session token cookie with the appropriate security settings
 */
export const setSessionTokenCookie = (
	response: Express.Response,
	token: string,
	expiresAt: Date
): void => {
	if (process.env.NODE_ENV === "production") {
		// When deployed over HTTPS
		response.cookie("session", token, {
			httpOnly: true,
			sameSite: "lax",
			expires: expiresAt,
			path: "/",
			secure: true,
		});
	} else {
		// When deployed over HTTP (localhost/development)
		response.cookie("session", token, {
			httpOnly: true,
			sameSite: "lax",
			expires: expiresAt,
			path: "/",
		});
	}
};

/**
 * Delete the session token cookie
 */
export const deleteSessionTokenCookie = (response: Express.Response): void => {
	if (process.env.NODE_ENV === "production") {
		// When deployed over HTTPS
		response.cookie("session", "", {
			httpOnly: true,
			sameSite: "lax",
			maxAge: 0,
			path: "/",
			secure: true,
		});
	} else {
		// When deployed over HTTP (localhost/development)
		response.cookie("session", "", {
			httpOnly: true,
			sameSite: "lax",
			maxAge: 0,
			path: "/",
		});
	}
};

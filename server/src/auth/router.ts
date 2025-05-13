import express from "express";
import { setSessionTokenCookie } from "./cookies.ts";
import { signupUser, getLoginCredentials } from "./login.ts";
import { generateSessionToken, createSession } from "./sessions.ts";

export const authRouter = express.Router();

authRouter.post(
	"/signup",
	async (req: express.Request, res: express.Response) => {
		const { username, password } = req.body;

		if (!username || !password) {
			return res.status(400).json({ error: "Missing required property" });
		}

		const user = await signupUser(username, password);
		console.log({ username, password, user });

		res.json({
			success: true,
			user,
		});
	}
);

authRouter.post(
	"/login",
	async (req: express.Request, res: express.Response) => {
		const { username, password } = req.body;

		if (!username || !password) {
			return res.status(400).json({ error: "Missing required property" });
		}

		const user = await getLoginCredentials(username, password);

		if (!user) {
			return res.status(401).json({ error: "Invalid credentials" });
		}

		// Generate a session token and create a session
		const token = generateSessionToken();
		const session = createSession(token, user.id);

		// Set the session cookie
		setSessionTokenCookie(res, token, session.expiresAt);

		// Return success response
		res.json({
			success: true,
			user: { id: user.id },
		});
	}
);

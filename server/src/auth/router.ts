import express from "express";
import { setSessionTokenCookie } from "./cookies.ts";
import { signupUser, getLoginCredentials } from "./login.ts";
import { generateSessionToken, createSession } from "./sessions.ts";
import { UserQueries } from "../user/queries.ts";
import { SessionQueries } from "./queries.ts";

export const createAuthRouter = (
	userQueries: UserQueries,
	sessionQueries: SessionQueries
) => {
	const authRouter = express.Router();
	authRouter.post(
		"/signup",
		async (req: express.Request, res: express.Response) => {
			try {
				const { username, password } = req.body;

				if (!username || !password) {
					throw new Error("missing fields");
				}

				const user = await signupUser(username, password, userQueries);
				res.json({
					success: true,
					username: user.name,
				});
			} catch (error) {
				res.status(401).json({
					success: false,
					error,
				});
			}
		}
	);

	authRouter.post(
		"/login",
		async (req: express.Request, res: express.Response) => {
			try {
				const { username, password } = req.body;

				if (!username || !password) {
					throw new Error("missing fields");
				}

				const user = await getLoginCredentials(username, password, userQueries);

				if (!user) {
					throw new Error("Invalid credentials");
				}
				const token = generateSessionToken();
				const session = createSession(token, user.id, sessionQueries);
				setSessionTokenCookie(res, token, session.expires_at);

				res.json({
					success: true,
					username: user.name,
				});
			} catch (error) {
				res.status(401).json({
					success: false,
					error,
				});
			}
		}
	);

	return authRouter;
};

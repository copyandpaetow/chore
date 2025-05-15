import express from "express";
import { setSessionTokenCookie } from "./cookies.ts";
import { signupUser, getLoginCredentials } from "./login.ts";
import { generateSessionToken, createSession } from "./sessions.ts";
import { type UserQueries } from "../user/queries.ts";
import { type SessionQueries } from "./queries.ts";
import { renderLogin } from "./view.ts";

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

				await signupUser(username, password, userQueries);

				return res.redirect("/");
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
				console.log({ username, password });

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

				return res.redirect("/");
			} catch (error) {
				res.status(401).json({
					success: false,
					error,
				});
			}
		}
	);

	authRouter.get(
		"/login",
		async (req: express.Request, res: express.Response) => {
			const template = await renderLogin();

			res.send(template);
		}
	);

	return authRouter;
};

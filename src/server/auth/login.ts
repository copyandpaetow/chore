import bcrypt from "bcrypt";
import { type Request, type Response } from "express";
import { type UserQueries } from "../user/queries.ts";
import { setSessionTokenCookie } from "./cookies.ts";
import { type SessionQueries } from "./queries.ts";
import { createSession, generateSessionToken } from "./sessions.ts";

export const getLoginCredentials = async (
	username: string,
	password: string,
	userQueries: UserQueries
) => {
	const registeredUser = userQueries.getByName(username);

	if (!registeredUser) {
		throw new Error("user or password incorrect");
	}

	// Check for password
	const isCorrectPassword = await bcrypt.compare(
		password,
		registeredUser!.password as string
	);
	if (!isCorrectPassword) {
		throw new Error("user or password incorrect");
	}

	return registeredUser;
};

export const handleLogin =
	(userQueries: UserQueries, sessionQueries: SessionQueries) =>
	async (req: Request, res: Response) => {
		try {
			const { username, password } = req.body;

			if (!username || !password) {
				throw new Error("some data is missing");
			}

			const user = await getLoginCredentials(username, password, userQueries);

			if (!user) {
				throw new Error("Invalid credentials");
			}

			const token = generateSessionToken();
			const session = createSession(token, user.id, sessionQueries);
			setSessionTokenCookie(res, token, session.expires_at);

			res.redirect("/");
		} catch (error) {
			res.status(401).json({
				success: false,
				error,
			});
		}
	};

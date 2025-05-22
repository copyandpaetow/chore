import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { type Request, type Response } from "express";
import { type UserQueries } from "../user/queries.ts";

export const handleSignup =
	(userQueries: UserQueries) => async (req: Request, res: Response) => {
		try {
			const { username, password } = req.body;

			if (!username || !password) {
				throw new Error("some data is missing");
			}

			const hashedPassword = await bcrypt.hash(password, 5);
			const userId = randomUUID();

			const recordedUser = userQueries.getByName(username);

			if (recordedUser) {
				throw new Error("user already exist");
			}

			const newUser = userQueries.create(
				userId,
				username,
				hashedPassword,
				Date.now()
			);

			if (!newUser) {
				throw new Error("error creating user");
			}

			res.redirect("/");
		} catch (error) {
			res.status(401).json({
				success: false,
				error,
			});
		}
	};

import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import { type UserQueries } from "../user/queries.ts";

export const signupUser = async (
	username: string,
	password: string,
	userQueries: UserQueries
) => {
	const hashedPassword = await bcrypt.hash(password, 5);
	const userId = randomUUID();

	const recordedUser = userQueries.getByName(username);

	if (recordedUser) {
		throw new Error("user already exsists");
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
	return newUser;
};

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

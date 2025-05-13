import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import { createUser, getUserByUsername } from "../user/queries.ts";

export const signupUser = async (username: string, password: string) => {
	const hashedPassword = await bcrypt.hash(password, 5);
	const userId = randomUUID();

	const recordedUser = getUserByUsername.get(username);

	if (recordedUser) return false;

	const newUser = createUser.get(userId, username, hashedPassword, Date.now());

	if (!newUser) return false;

	return {
		id: newUser.id,
		name: newUser.name,
		joined: new Date(newUser.created_at as string).toISOString(),
	};
};

export const getLoginCredentials = async (
	username: string,
	password: string
) => {
	const registeredUser = getUserByUsername.get(username);

	if (!registeredUser) false;

	// Check for password
	const isCorrectPassword = await bcrypt.compare(
		password,
		registeredUser!.password as string
	);
	if (!isCorrectPassword) {
		return false;
	}

	return registeredUser;
};

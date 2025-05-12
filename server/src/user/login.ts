import { randomUUID } from "crypto";
import { createUser, getUserByUsername } from "./db.ts";
import bcrypt from "bcrypt";

export const signupUser = async (username: string, password: string) => {
	const hashedPassword = await bcrypt.hash(password, 5);
	const userId = randomUUID();

	const recordedUser = getUserByUsername.get(username);

	if (recordedUser) return false;

	const newUser = createUser.get(userId, username, hashedPassword, Date.now());
	return {
		userId: newUser.user_id,
		username: newUser.username,
		joined: new Date(newUser.created_at).toISOString(),
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
		registeredUser.password
	);
	if (!isCorrectPassword) {
		return false;
	}

	return registeredUser;
};

import { DatabaseSync } from "node:sqlite";
import { type User } from "../db/user.ts";

export type UserQueries = {
	create(
		id: string,
		name: string,
		password: string,
		created_at: number
	): User | undefined;
	getByName(name: string): User | undefined;
	getById(id: string): User | undefined;
};

export const createUserQueries = (database: DatabaseSync): UserQueries => {
	const createUser = database.prepare(`
  INSERT INTO user (id, name, password, created_at)
  VALUES (?, ?, ?, ?)
  RETURNING id, name, password, created_at
`);

	const getUserByUsername = database.prepare(`
  SELECT * FROM user WHERE name = ?
`);

	const getUserById = database.prepare(`
  SELECT * FROM user WHERE id = ?
`);

	return {
		create(id: string, name: string, password: string, created_at: number) {
			if (!id || !name || !password) {
				throw new Error("Missing required fields for user creation");
			}

			try {
				return createUser.get(id, name, password, created_at) as
					| User
					| undefined;
			} catch (error) {
				console.error("Database error:", error);
				throw new Error("Failed to create user");
			}
		},
		getByName(name: string) {
			if (!name) {
				throw new Error("User name is required");
			}

			try {
				return getUserByUsername.get(name) as User | undefined;
			} catch (error) {
				console.error("Database error:", error);
				throw new Error("Failed to get user by name");
			}
		},
		getById(id: string) {
			if (!id) {
				throw new Error("User id is required");
			}
			try {
				return getUserById.get(id) as User | undefined;
			} catch (error) {
				console.error("Database error:", error);
				throw new Error("Failed to get user by id");
			}
		},
	};
};

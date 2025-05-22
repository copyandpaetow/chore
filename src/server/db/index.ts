import { DatabaseSync } from "node:sqlite";
import path from "path";
import { choreSchema } from "./chore.ts";
import { sessionSchema } from "./session.ts";
import { userSchema } from "./user.ts";
import { pushSubscriptionSchema } from "./push-subscription.ts";

export { choreSchema, sessionSchema, userSchema };

const dbPath =
	process.env.DB_PATH || path.resolve(process.cwd(), "db", "main.db");
const database = new DatabaseSync(dbPath);

export const initializeSchema = () => {
	try {
		database.exec(userSchema);
		console.log("User schema initialized");

		database.exec(sessionSchema);
		console.log("Session schema initialized");

		database.exec(choreSchema);
		console.log("Chore schema initialized");

		database.exec(pushSubscriptionSchema);
		console.log("web push schema initialized");
		return database;
	} catch (error) {
		console.error("Failed to initialize schema:", error);
		throw error;
	}
};

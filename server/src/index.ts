import cors from "cors";
import express from "express";
import { createChoreQueries } from "./chores/queries.ts";
import { createChoreRouter } from "./chores/router.ts";
import { config } from "./config.ts";
import { initializeSchema } from "./db/index.ts";
import { createSessionQueries } from "./auth/queries.ts";
import { createUserQueries } from "./user/queries.ts";
import { createAuthRouter } from "./auth/router.ts";
import { createAuthMiddleware } from "./auth/middleware.ts";

try {
	console.log("Initializing database schema...");
	const database = initializeSchema();
	const userQueries = createUserQueries(database);
	const sessionQueries = createSessionQueries(database);
	const choreQueries = createChoreQueries(database);

	const authMiddleWare = createAuthMiddleware(userQueries, sessionQueries);

	const authRouter = createAuthRouter(userQueries, sessionQueries);
	const choreRouter = createChoreRouter(choreQueries, authMiddleWare);

	const app = express();
	app.use(
		cors({
			origin: [
				"http://localhost:5173",
				"http://localhost:8080",
				"http://raspberrypi.local:8080",
			],
			credentials: true,
			methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
			allowedHeaders: ["Content-Type", "Authorization"],
		})
	);
	app.use(express.json());

	app.use("/auth", authRouter);
	app.use("/chore", choreRouter);

	app.listen(config.port, () => {
		console.log(`Server running on port ${config.port}`);
	});
} catch (error) {
	console.error("Failed to start server:", error);
	process.exit(1);
}

import cors from "cors";
import express from "express";
import { createChoreQueries } from "./services/chores/queries.ts";
import { createChoreRouter } from "./services/chores/router.ts";
import path from "path";
import { config } from "./config.ts";
import { createAuthMiddleware } from "./services/auth/middleware.ts";
import { createSessionQueries } from "./services/auth/queries.ts";
import { createAuthRouter } from "./services/auth/router.ts";
import { initializeSchema } from "./services/db/index.ts";
import { createUserQueries } from "./services/user/queries.ts";

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
			origin: ["http://localhost:3000", "http://raspberrypi.local:3000"],
			credentials: true,
			methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
			allowedHeaders: ["Content-Type", "Authorization"],
		})
	);
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));
	app.use(express.static("public"));

	app.use("/", authRouter);
	app.use("/", choreRouter);

	app.listen(config.port, () => {
		console.log(`Server running on port ${config.port}`);
	});
} catch (error) {
	console.error("Failed to start server:", error);
	process.exit(1);
}

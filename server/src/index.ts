import cors from "cors";
import express from "express";
import { authRouter } from "./auth/router.ts";
import { choreRouter } from "./chores/router.ts";
import { initializeSchema } from "./db/index.ts";
import { config } from "./config.ts";

try {
	console.log("Initializing database schema...");
	initializeSchema();

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

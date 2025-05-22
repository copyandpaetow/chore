import cors from "cors";
import express, { type Request, type Response } from "express";
import fs from "fs";
import { Document, Window } from "happy-dom";
import http from "http";
import path from "path";
import { config } from "./config.ts";
import { handleLogin } from "./server/auth/login.ts";
import { createAuthMiddleware } from "./server/auth/middleware.ts";
import { createSessionQueries } from "./server/auth/queries.ts";
import { handleSignup } from "./server/auth/signup.ts";
import { initializeSchema } from "./server/db/index.ts";
import { createUserQueries } from "./server/user/queries.ts";
import { fileURLToPath } from "url";

const PAGES = {
	HOME: "dist/home.html",
	LOGIN: "dist/login.html",
	CREATE_CHORE: "dist/create.html",
	ERROR: "dist/error.html",
	NOT_FOUND: "dist/not-found.html",
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const noopTransform = (self: Document) => self;

const renderPage = (templatePath: string, transform = noopTransform) => {
	return async (req: Request, res: Response) => {
		try {
			const fullPath = path.join(process.cwd(), templatePath);
			let html = fs.readFileSync(fullPath, "utf-8");

			const window = new Window();
			const document = window.document;
			document.write(html);
			await window.happyDOM.waitUntilComplete();

			const transformedDom = transform(document);
			res.send(transformedDom.documentElement.outerHTML);
		} catch (error) {
			res.status(500).send({
				success: false,
				error,
			});
		}
	};
};

try {
	console.log("Initializing database schema...");
	const database = initializeSchema();
	const userQueries = createUserQueries(database);
	const sessionQueries = createSessionQueries(database);
	// const pushQueries = createPushQueries(database);
	// const choreQueries = createChoreQueries(database);

	const authMiddleWare = createAuthMiddleware(userQueries, sessionQueries);

	const app = express();
	const httpServer = http.createServer(app);

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
	app.use(express.static("dist"));

	app.get("/", authMiddleWare, renderPage(PAGES.HOME));
	app.get("/create-chore", authMiddleWare, renderPage(PAGES.CREATE_CHORE));
	app.get("/login", renderPage(PAGES.LOGIN));

	// API routes
	app.post("/login", handleLogin(userQueries, sessionQueries));
	app.post("/signup", handleSignup(userQueries));
	//app.post("/chores", authMiddleWare, createChore);

	// Error handling
	app.use(renderPage(PAGES.NOT_FOUND));
	//@ts-expect-error
	app.use((err, req, res, next) => {
		res.status(500);
		renderPage(PAGES.NOT_FOUND)(req, res);
	});

	httpServer.listen(config.port, () => {
		console.log(`Server running on port ${config.port}`);
	});
} catch (error) {
	console.error("Failed to start server:", error);
	process.exit(1);
}

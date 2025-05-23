import cors from "cors";
import express, { type Request, type Response } from "express";
import fs from "fs";
import { Document, Window } from "happy-dom";
import http from "http";
import path from "path";
import { config } from "./config.ts";
import { transformHome } from "./pages/home/transform.ts";
import { handleLogin } from "./server/auth/login.ts";
import { createAuthMiddleware } from "./server/auth/middleware.ts";
import { createSessionQueries } from "./server/auth/queries.ts";
import { handleSignup } from "./server/auth/signup.ts";
import { completeChore } from "./server/chores/complete.ts";
import { createChore } from "./server/chores/create.ts";
import { deleteChore } from "./server/chores/delete.ts";
import { getAllChores } from "./server/chores/get-all.ts";
import { createChoreQueries } from "./server/chores/queries.ts";
import { reserveChore } from "./server/chores/reserve.ts";
import { initializeSchema } from "./server/db/index.ts";
import { getPublicVapidKey } from "./server/push/keys.ts";
import { createPushQueries } from "./server/push/queries.ts";
import { createUserQueries } from "./server/user/queries.ts";
import { registerPush } from "./server/push/register.ts";
import { unregisterPush } from "./server/push/unregister.ts";

const PAGES = {
	HOME: "dist/home.html",
	LOGIN: "dist/login.html",
	CREATE_CHORE: "dist/create.html",
	ERROR: "dist/error.html",
	NOT_FOUND: "dist/not-found.html",
};

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
	const pushQueries = createPushQueries(database);
	const choreQueries = createChoreQueries(database);

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

	app.get("/", authMiddleWare, (req, res) =>
		renderPage(PAGES.HOME, (dom) =>
			transformHome(dom, getAllChores(choreQueries, req))
		)(req, res)
	);
	app.get("/create-chore", authMiddleWare, renderPage(PAGES.CREATE_CHORE));
	app.get("/login", renderPage(PAGES.LOGIN));

	// API routes
	app.post("/login", handleLogin(userQueries, sessionQueries));
	app.post("/signup", handleSignup(userQueries));
	app.post("/create", authMiddleWare, createChore(choreQueries));
	app.post(
		"/:id/complete",
		authMiddleWare,
		completeChore(choreQueries, pushQueries)
	);
	app.post("/:id/reserve", authMiddleWare, reserveChore(choreQueries));
	app.delete("/:id", authMiddleWare, deleteChore(choreQueries));
	app.get("/vapidPublicKey", getPublicVapidKey());
	app.post("/register", authMiddleWare, registerPush(pushQueries));
	app.post("/unregister", authMiddleWare, unregisterPush(pushQueries));

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

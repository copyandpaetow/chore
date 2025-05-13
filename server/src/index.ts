import cors from "cors";
import express from "express";
import { setSessionTokenCookie } from "./auth/cookies.ts";
import { getCurrentUser, requireAuth } from "./auth/index.ts";
import { getLoginCredentials, signupUser } from "./auth/login.ts";
import { createSession, generateSessionToken } from "./auth/sessions.ts";
import {
	completeChore,
	createNewChore,
	getChoreHistory,
	getUserChores,
	removeChore,
	reserveChore,
} from "./auth/chores.ts";

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

// --- Public routes ---

// Signup route
app.post("/api/signup", async (req: express.Request, res: express.Response) => {
	const { username, password } = req.body;

	if (!username || !password) {
		return res.status(400).json({ error: "Missing required property" });
	}

	const user = await signupUser(username, password);
	console.log({ username, password, user });

	res.json({
		success: true,
		user,
	});
});

// Login route
app.post("/api/login", async (req: express.Request, res: express.Response) => {
	const { username, password } = req.body;

	if (!username || !password) {
		return res.status(400).json({ error: "Missing required property" });
	}

	const user = await getLoginCredentials(username, password);

	if (!user) {
		return res.status(401).json({ error: "Invalid credentials" });
	}

	// Generate a session token and create a session
	const token = generateSessionToken();
	const session = createSession(token, user.id);

	// Set the session cookie
	setSessionTokenCookie(res, token, session.expiresAt);

	// Return success response
	res.json({
		success: true,
		user: { id: user.id },
	});
});

// --- Protected Routes ---

// Get all chores for the current user
app.get(
	"/api/chores",
	requireAuth,
	(req: express.Request, res: express.Response) => {
		const user = getCurrentUser(req);
		const chores = getUserChores(user.id);

		res.json({
			success: true,
			chores,
		});
	}
);

// Create a new chore
app.post(
	"/api/chore",
	requireAuth,
	(req: express.Request, res: express.Response) => {
		const { title, frequency } = req.body;

		if (!title || !frequency) {
			return res.status(400).json({ error: "Missing required properties" });
		}

		if (!["weekly", "monthly", "quarterly"].includes(frequency)) {
			return res.status(400).json({
				error: "Invalid frequency. Must be weekly, monthly, or quarterly",
			});
		}

		const {
			description = "",
			difficulty = 3,
			isPrivate = false,
			firstDueDate,
		} = req.body;

		const user = getCurrentUser(req);
		const chore = createNewChore(
			title,
			user.id,
			frequency,
			description,
			difficulty,
			isPrivate,
			firstDueDate
		);

		if (!chore) {
			return res.status(500).json({ error: "Failed to create chore" });
		}

		res.json({
			success: true,
			chore,
		});
	}
);

// Mark a chore as complete
app.post(
	"/api/chores/:id/complete",
	requireAuth,
	(req: express.Request, res: express.Response) => {
		const choreId = req.params.id;
		const user = getCurrentUser(req);

		const result = completeChore(choreId, user.id);

		if (!result.success) {
			return res.status(400).json({ error: result.error });
		}

		res.json({
			success: true,
			chore: result.chore,
		});
	}
);

// Delete a chore
app.delete(
	"/api/chores/:id",
	requireAuth,
	(req: express.Request, res: express.Response) => {
		const choreId = req.params.id;
		const user = getCurrentUser(req);

		const result = removeChore(choreId, user.id);

		res.json(result);
	}
);

// Mark a chore as complete
app.post(
	"/api/chores/:id/reserve",
	requireAuth,
	(req: express.Request, res: express.Response) => {
		const choreId = req.params.id;
		const user = getCurrentUser(req);

		const result = reserveChore(choreId, user.id);

		if (!result.success) {
			return res.status(400).json({ error: result.error });
		}

		res.json({
			success: true,
			chore: result.chore,
		});
	}
);

// Get chore completion history
app.get(
	"/api/chores/history",
	requireAuth,
	(req: express.Request, res: express.Response) => {
		const user = getCurrentUser(req);
		const history = getChoreHistory(user.id);

		res.json({
			success: true,
			history,
		});
	}
);

app.get("/", (req, res) => {
	res.json({ message: "Chores API is running" });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

import express from "express";
import cors from "cors";
import {
	requireAuth,
	optionalAuth,
	getCurrentUser,
	getCurrentSession,
} from "./auth/index.ts";
import {
	createSession,
	generateSessionToken,
	invalidateSession,
} from "./auth/sessions.ts";
import {
	deleteSessionTokenCookie,
	setSessionTokenCookie,
} from "./auth/cookies.ts";
import { getLoginCredentials, signupUser } from "./user/login.ts";

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

	console.log("here", user);
	// Generate a session token and create a session
	const token = generateSessionToken();
	const session = createSession(token, user.user_id);

	// Set the session cookie
	setSessionTokenCookie(res, token, session.expiresAt);

	// Return success response
	res.json({
		success: true,
		user: { id: user.user_id },
	});
});

// Logout route
app.post("/api/logout", optionalAuth, (req, res) => {
	const session = getCurrentSession(req);

	if (session) {
		// Invalidate the session
		invalidateSession(session.id);

		// Clear the session cookie
		deleteSessionTokenCookie(res);
	}

	res.json({ success: true });
});

// --- Protected routes (require authentication) ---

// Example protected resource
app.get("/api/protected-data", requireAuth, (req, res) => {
	// Access is granted because requireAuth passed
	res.json({
		message: "This is protected data",
		userId: getCurrentUser(req).id,
	});
});

app.get("/", (req, res) => {
	res.json({ message: "Todo API is running" });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

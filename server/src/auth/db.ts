import { DatabaseSync } from "node:sqlite";

import path from "path";

// Use environment variable with fallback to a resolved path
const dbPath =
	process.env.DB_AUTH_PATH || path.resolve(process.cwd(), "db", "auth.db");
export const database = new DatabaseSync(dbPath);

const initDatabase = `
CREATE TABLE IF NOT EXISTS user (
    id TEXT NOT NULL PRIMARY KEY
);


CREATE TABLE IF NOT EXISTS session (
    session_id TEXT NOT NULL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES user(id),
    expires_at INTEGER NOT NULL
);
`;

database.exec(initDatabase);

export const addSession = database.prepare(
	"INSERT INTO session (session_id, user_id, expires_at) VALUES (?, ?, ?)"
);

export const deleteSession = database.prepare(
	"DELETE FROM session WHERE session_id = ?"
);

export const updateSession = database.prepare(
	"UPDATE session SET expires_at = ? WHERE session_id = ?"
);

export const getSession = database.prepare(
	"SELECT session.session_id, session.user_id, session.expires_at, user.id FROM session INNER JOIN user ON user.id = session.user_id WHERE session_id = ?"
);

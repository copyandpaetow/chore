import { DatabaseSync } from "node:sqlite";
import { type Session } from "../db/session.ts";

export type SessionQueries = {
	get(id: string): Session | undefined;
	add(id: string, user_id: string, expires_at: number): Session | undefined;
	delete(id: string): void;
	update(id: string, expires_at: number): Session | undefined;
};

export const createSessionQueries = (
	database: DatabaseSync
): SessionQueries => {
	const getSession = database.prepare(
		`SELECT 
      session.id AS id, 
      session.user_id, 
      session.expires_at,
      user.id AS user_id 
    FROM session
    INNER JOIN user ON user.id = session.user_id 
    WHERE session.id = ?`
	);

	const addSession = database.prepare(
		`INSERT INTO session (id, user_id, expires_at) 
		VALUES (?, ?, ?)
		RETURNING id, user_id, expires_at`
	);

	const deleteSession = database.prepare("DELETE FROM session WHERE id = ?");

	const updateSession = database.prepare(`
    UPDATE session 
    SET expires_at = ? 
    WHERE id = ?
    RETURNING id, user_id, expires_at
  `);

	return {
		get(id: string) {
			if (!id) {
				throw new Error("Missing required fields for session getter");
			}

			try {
				return getSession.get(id) as Session | undefined;
			} catch (error) {
				console.error("Database error:", error);
				throw new Error("Failed to get session");
			}
		},
		add(id: string, user_id: string, expires_at: number) {
			if (!id || !user_id) {
				throw new Error("Missing required fields for session additon");
			}

			try {
				return addSession.get(id, user_id, expires_at) as Session | undefined;
			} catch (error) {
				console.error("Database error:", error);
				throw new Error("Failed to add session");
			}
		},
		delete(id: string) {
			if (!id) {
				throw new Error("Missing id for session deletion");
			}

			try {
				deleteSession.run(id);
			} catch (error) {
				console.error("Database error:", error);
				throw new Error("Failed to delete session");
			}
		},
		update(id: string, expires_at: number) {
			if (!id) {
				throw new Error("Missing required fields for session update");
			}

			try {
				return updateSession.get(id, expires_at) as Session | undefined;
			} catch (error) {
				console.error("Database error:", error);
				throw new Error("Failed to update session");
			}
		},
	};
};

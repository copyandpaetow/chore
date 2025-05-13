import { database } from "../db/index.ts";

export const addSession = database.prepare(
	"INSERT INTO session (id, user_id, expires_at) VALUES (?, ?, ?)"
);

export const deleteSession = database.prepare(
	"DELETE FROM session WHERE id = ?"
);

export const updateSession = database.prepare(
	"UPDATE session SET expires_at = ? WHERE id = ?"
);

export const getSession = database.prepare(
	`SELECT s.id AS session_id, s.user_id, s.expires_at, u.id AS user_id 
   FROM session s 
   INNER JOIN user u ON u.id = s.user_id 
   WHERE s.id = ?`
);

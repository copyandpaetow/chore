import { DatabaseSync } from "node:sqlite";

import path from "path";

// Use environment variable with fallback to a resolved path
const dbPath =
	process.env.DB_PATH || path.resolve(process.cwd(), "db", "main.db");
export const database = new DatabaseSync(dbPath);

const initDatabase = `
CREATE TABLE IF NOT EXISTS user (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at INTEGER NOT NULL
);


CREATE TABLE IF NOT EXISTS session (
    id TEXT NOT NULL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES user(id),
    expires_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS chore (
  id TEXT NOT NULL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  created_at INTEGER NOT NULL,
  frequency TEXT NOT NULL CHECK(frequency IN ('weekly', 'monthly', 'quarterly')),
  owner_id TEXT REFERENCES user(id),
  next_due_date INTEGER NOT NULL,
  difficulty INTEGER DEFAULT 3 CHECK(difficulty BETWEEN 1 AND 5),
  reserved_by TEXT REFERENCES user(id), 
  reserved_until INTEGER, 
  is_private BOOLEAN NOT NULL CHECK (is_private IN (0, 1)) 
);

CREATE TABLE IF NOT EXISTS chore_completion (
  id TEXT NOT NULL PRIMARY KEY,
  chore_id TEXT NOT NULL REFERENCES chore(id),
  completed_by TEXT NOT NULL REFERENCES user(id),
  completed_at INTEGER NOT NULL
);
`;

database.exec(initDatabase);

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

export const createUser = database.prepare(`
  INSERT INTO user (id, name, password, created_at)
  VALUES (?, ?, ?, ?)
  RETURNING id, name, created_at
`);

export const getUserByUsername = database.prepare(`
  SELECT * FROM user WHERE name = ?
`);

export const getUserById = database.prepare(`
  SELECT * FROM user WHERE id = ?
`);

export const createChore = database.prepare(`
  INSERT INTO chore (id, title, description, created_at, frequency, owner_id, next_due_date, difficulty, is_private)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  RETURNING id, title, description, created_at, frequency, owner_id, next_due_date, difficulty, is_private
`);

export const getChoresByUserId = database.prepare(`
  SELECT * FROM chore 
  WHERE is_private = FALSE
     OR (is_private = TRUE AND owner_id = ?)
  ORDER BY next_due_date ASC
`);

export const getChoreById = database.prepare(`
  SELECT * FROM chore WHERE id = ?
`);

export const updateChoreNextDueDate = database.prepare(`
  UPDATE chore SET next_due_date = ? WHERE id = ?
  RETURNING id, title, description, created_at, frequency, owner_id, next_due_date
`);

export const deleteChore = database.prepare(`
  DELETE FROM chore WHERE id = ? AND owner_id = ?
`);

export const addChoreCompletion = database.prepare(`
  INSERT INTO chore_completion (id, chore_id, completed_by, completed_at)
  VALUES (?, ?, ?, ?)
  RETURNING id, chore_id, completed_by, completed_at
`);

export const getChoreCompletions = database.prepare(`
  SELECT cc.*, c.title, c.frequency 
  FROM chore_completion cc
  INNER JOIN chore c ON c.id = cc.chore_id
  WHERE c.owner_id = ?
  ORDER BY completed_at DESC
`);

export const getChoreCompletionsByChoreId = database.prepare(`
  SELECT * FROM chore_completion 
  WHERE chore_id = ?
  ORDER BY completed_at DESC
`);

export const reserveUnreservedChore = database.prepare(`
  UPDATE chore 
  SET reserved_by = ?, reserved_until = ? 
  WHERE id = ? AND reserved_by IS NULL
  RETURNING *
`);

export const releaseReservedChore = database.prepare(`
  UPDATE chore 
  SET reserved_by = null, reserved_until = null 
  WHERE id = ? AND reserved_by = ?
  RETURNING *
`);

export const updateChoreReservation = database.prepare(`
  UPDATE chore 
  SET reserved_by = ?, reserved_until = ? 
  WHERE id = ?
`);

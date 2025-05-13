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

// export const createTodo = database.prepare(`
//   INSERT INTO todos (todo_id, todo_owner, title, created_at)
//   VALUES (?, ?, ?, ?)
//   RETURNING todo_id, title, checked, created_at
// `);

// export const getTodosByUserId = database.prepare(`
//   SELECT * FROM todos WHERE todo_owner = ?
// `);

// export const getTodoById = database.prepare(`
//   SELECT * FROM todos WHERE todo_id = ?
// `);

// export const updateTodoCheckById = database.prepare(`
//   UPDATE todos SET checked = ?, checked_at = ? WHERE todo_owner = ? AND todo_id = ?
//   RETURNING todo_id, title, checked_at, created_at
// `);

// export const deleteTodo = database.prepare(`
//   DELETE from todos WHERE todo_id = ? AND todo_owner = ?
// `);

import { DatabaseSync } from "node:sqlite";
import path from "path";

const dbPath =
	process.env.DB_USER_PATH || path.resolve(process.cwd(), "db", "user.db");
export const database = new DatabaseSync(dbPath);

const initDatabase = `
CREATE TABLE IF NOT EXISTS users (
  user_id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS todos (
  todo_id TEXT PRIMARY KEY,
  todo_owner TEXT NOT NULL, 
  title TEXT NOT NULL,
  checked INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  checked_at INTEGER,
  FOREIGN KEY (todo_owner) REFERENCES users (user_id)
);
`;

database.exec(initDatabase);

export const createUser = database.prepare(`
  INSERT INTO users (user_id, username, password, created_at)
  VALUES (?, ?, ?, ?)
  RETURNING user_id, username, created_at
`);

export const getUserByUsername = database.prepare(`
  SELECT * FROM users WHERE username = ?
`);

export const getUserById = database.prepare(`
  SELECT * FROM users WHERE user_id = ?
`);

export const createTodo = database.prepare(`
  INSERT INTO todos (todo_id, todo_owner, title, created_at)
  VALUES (?, ?, ?, ?)
  RETURNING todo_id, title, checked, created_at
`);

export const getTodosByUserId = database.prepare(`
  SELECT * FROM todos WHERE todo_owner = ?
`);

export const getTodoById = database.prepare(`
  SELECT * FROM todos WHERE todo_id = ?
`);

export const updateTodoCheckById = database.prepare(`
  UPDATE todos SET checked = ?, checked_at = ? WHERE todo_owner = ? AND todo_id = ? 
  RETURNING todo_id, title, checked_at, created_at
`);

export const deleteTodo = database.prepare(`
  DELETE from todos WHERE todo_id = ? AND todo_owner = ?  
`);

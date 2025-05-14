export type User = {
	id: string;
	name: string;
	password: string;
	created_at: number;
};

export const userSchema = `
  CREATE TABLE IF NOT EXISTS user (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at INTEGER NOT NULL
);`;

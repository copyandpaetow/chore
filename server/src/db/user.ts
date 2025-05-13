export type UserSchema = {
	id: string;
	name: string;
	password: string;
	created_at: string;
};

export const userSchema = `
  CREATE TABLE IF NOT EXISTS user (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at INTEGER NOT NULL
);`;

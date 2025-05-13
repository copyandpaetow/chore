import { database } from "../db/index.ts";
import { UserSchema } from "../db/user.ts";

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

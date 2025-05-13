export type SessionSchema = {
	id: string;
	user_id: string;
	expires_at: string;
};

export const sessionSchema = `
  CREATE TABLE IF NOT EXISTS session (
    id TEXT NOT NULL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES user(id),
    expires_at INTEGER NOT NULL
);`;

export type Session = {
	id: string;
	user_id: string;
	expires_at: number;
};

export const sessionSchema = `
  CREATE TABLE IF NOT EXISTS session (
    id TEXT NOT NULL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES user(id),
    expires_at INTEGER NOT NULL
);`;

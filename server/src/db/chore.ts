export type Difficulty = 1 | 2 | 3 | 4 | 5;

export type ChoreSchema = {
	id: string;
	title: string;
	description: string;
	created_at: string;
	frequency: string;
	next_due_date: string;
	difficulty: Difficulty;
	reserved_by: string | null;
	reserved_until: string | null;
	is_private: boolean;
};

export type ChoreCompletion = {
	id: string;
	chore_id: string;
	completed_by: string;
	completed_at: number;
};

export const choreSchema = `
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

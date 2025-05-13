import { database } from "../db/index.ts";

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

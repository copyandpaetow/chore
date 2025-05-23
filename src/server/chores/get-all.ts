import { type Request, type Response } from "express";
import { type ChoreQueries } from "./queries.ts";
import { getCurrentUser } from "../user/helper.ts";

export const getAllChores = (choreQueries: ChoreQueries, req: Request) => {
	const user = getCurrentUser(req)!;
	const chores = choreQueries.getAllByUserId(user.id);

	return chores || [];
};

import { getCurrentUser } from "../user/helper.ts";
import { type ChoreQueries } from "./queries.ts";
import { type Request, type Response } from "express";

export const reserveChore =
	(choreQueries: ChoreQueries) => async (req: Request, res: Response) => {
		try {
			const choreId = req.params.id;
			const user = getCurrentUser(req)!;
			const reservationExpiry = Date.now() + 24 * 60 * 60 * 1000;
			const chore = choreQueries.reserve(user.id, reservationExpiry, choreId);

			if (chore) {
				res.json({
					success: true,
					chore,
				});
				return;
			}

			// Get info about current reservation
			const currentReservation = choreQueries.getById(choreId);

			// If reservation exists but has expired, we can force update
			if (
				currentReservation &&
				currentReservation.reserved_until! < Date.now()
			) {
				const updatedChore = choreQueries.updateReservation(
					user.id,
					reservationExpiry,
					choreId
				);
				res.json({
					success: true,
					chore: updatedChore,
				});
				return;
			}

			res.status(400).json({
				success: false,
				error: "Chore is already reserved",
				reservedBy: currentReservation?.reserved_by,
				reserved_until: currentReservation?.reserved_until,
			});
		} catch (error) {
			res.status(401).json({
				success: false,
				error,
			});
		}
	};

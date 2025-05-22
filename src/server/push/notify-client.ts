import { type PushQueries } from "./queries.ts";
import webpush from "web-push";

export const sendNotificationToUsers = async (
	userIds: string[],
	payload: Object,
	excludeUserId: string,
	pushQueries: PushQueries
): Promise<{ success: boolean; errors?: string[] }> => {
	if (!userIds || userIds.length === 0) {
		return { success: true };
	}

	try {
		// Filter out excluded user
		const targetUserIds = excludeUserId
			? userIds.filter((id) => id !== excludeUserId)
			: userIds;

		if (targetUserIds.length === 0) {
			return { success: true };
		}

		// Get subscriptions for these users
		const subscriptions =
			pushQueries.getSubscriptionsByUserIds(targetUserIds) || [];

		if (subscriptions.length === 0) {
			return { success: true };
		}

		const errors: string[] = [];

		// Send to each subscription
		const sendPromises = subscriptions.map(async (sub) => {
			try {
				const parsedSubscription = JSON.parse(sub.details);
				await webpush.sendNotification(
					parsedSubscription,
					JSON.stringify(payload)
				);
				return true;
			} catch (error) {
				pushQueries.deleteSubscription(sub.id);

				errors.push(`Failed to send to subscription ${sub.id}: ${error}`);
				return false;
			}
		});

		await Promise.all(sendPromises);

		return {
			success: true,
			errors: errors.length > 0 ? errors : undefined,
		};
	} catch (error) {
		console.error("Error sending push notifications:", error);
		return {
			success: false,
			errors: [`General error: ${error}`],
		};
	}
};

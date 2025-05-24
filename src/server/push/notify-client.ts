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
		const targetUserIds = excludeUserId
			? userIds.filter((id) => id !== excludeUserId)
			: userIds;

		if (targetUserIds.length === 0) {
			return { success: true };
		}

		for (const userId of targetUserIds) {
			const subscriptions = pushQueries.getSubscriptionsByUserId(userId) || [];

			for await (const sub of subscriptions) {
				try {
					const parsedSubscription = JSON.parse(sub.details);
					await webpush.sendNotification(
						parsedSubscription,
						JSON.stringify(payload)
					);
				} catch (error) {
					pushQueries.deleteSubscription(sub.id);
					console.error(`Failed to send to subscription ${sub.id}: ${error}`);
				}
			}
		}

		return {
			success: true,
		};
	} catch (error) {
		console.error("Error sending push notifications:", error);
		return {
			success: false,
			errors: [`General error: ${error}`],
		};
	}
};

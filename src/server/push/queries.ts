// In push/queries.ts

import { randomUUID } from "crypto";
import { DatabaseSync } from "node:sqlite";

export type PushSubscription = {
	id: string;
	user_id: string;
	details: string; // JSON stringified PushSubscription object
	created_at: number;
};

export type PushQueries = {
	saveSubscription(
		userId: string,
		subscription: Object
	): PushSubscription | undefined;
	getSubscriptionsByUserId(userId: string): PushSubscription[] | undefined;
	getSubscriptionsByUserIds(userIds: string[]): PushSubscription[] | undefined;
	getSubscriptionByEndpoint(endpoint: string): PushSubscription | undefined;
	deleteSubscription(id: string): void;
	deleteSubscriptionByEndpoint(endpoint: string): void;
};

export const createPushQueries = (database: DatabaseSync): PushQueries => {
	// Add subscription to database
	const addSubscription = database.prepare(`
    INSERT INTO push_subscription (id, user_id, details, created_at)
    VALUES (?, ?, ?, ?)
    RETURNING id, user_id, details, created_at
  `);

	// Get subscriptions by user ID
	const getSubscriptionsByUser = database.prepare(`
    SELECT * FROM push_subscription 
    WHERE user_id = ?
  `);

	// Get a subscription by endpoint URL
	const getSubscriptionByEndpoint = database.prepare(`
    SELECT * FROM push_subscription 
    WHERE json_extract(details, '$.endpoint') = ?
  `);

	// Delete a subscription by ID
	const deleteSubscriptionById = database.prepare(`
    DELETE FROM push_subscription 
    WHERE id = ?
  `);

	// Delete a subscription by endpoint URL
	const deleteSubscriptionByEndpointUrl = database.prepare(`
    DELETE FROM push_subscription 
    WHERE json_extract(details, '$.endpoint') = ?
  `);

	// Helper function to get placeholders for SQL IN clause
	const getPlaceholders = (count: number): string => {
		return Array(count).fill("?").join(",");
	};

	return {
		saveSubscription(
			userId: string,
			subscription: Object
		): PushSubscription | undefined {
			if (!userId || !subscription) {
				throw new Error("User ID and subscription object are required");
			}

			try {
				// Check if this subscription already exists by endpoint
				const endpoint = (subscription as any).endpoint;
				const existingSubscription = this.getSubscriptionByEndpoint(endpoint);

				if (existingSubscription) {
					// If it exists but for a different user, update the user_id
					if (existingSubscription.user_id !== userId) {
						// Delete the old one and create a new one
						this.deleteSubscription(existingSubscription.id);
					} else {
						// Same user, same endpoint - no need to update
						return existingSubscription;
					}
				}

				// Create a new subscription
				const id = randomUUID();
				const now = Date.now();
				const details = JSON.stringify(subscription);

				return addSubscription.get(id, userId, details, now) as
					| PushSubscription
					| undefined;
			} catch (error) {
				console.error("Database error:", error);
				throw new Error("Failed to save push subscription");
			}
		},

		getSubscriptionsByUserId(userId: string): PushSubscription[] | undefined {
			if (!userId) {
				throw new Error("User ID is required");
			}

			try {
				return getSubscriptionsByUser.all(userId) as
					| PushSubscription[]
					| undefined;
			} catch (error) {
				console.error("Database error:", error);
				throw new Error("Failed to get push subscriptions");
			}
		},

		getSubscriptionsByUserIds(
			userIds: string[]
		): PushSubscription[] | undefined {
			if (!userIds || userIds.length === 0) {
				return [];
			}

			try {
				// Create a dynamic query based on the number of userIds
				const placeholders = getPlaceholders(userIds.length);
				const query = `
          SELECT * FROM push_subscription 
          WHERE user_id IN (${placeholders})
        `;

				// Prepare and execute the query
				const statement = database.prepare(query);
				return statement.all(...userIds) as PushSubscription[] | undefined;
			} catch (error) {
				console.error("Database error:", error);
				throw new Error("Failed to get push subscriptions by user IDs");
			}
		},

		getSubscriptionByEndpoint(endpoint: string): PushSubscription | undefined {
			if (!endpoint) {
				throw new Error("Endpoint is required");
			}

			try {
				return getSubscriptionByEndpoint.get(endpoint) as
					| PushSubscription
					| undefined;
			} catch (error) {
				console.error("Database error:", error);
				throw new Error("Failed to get push subscription by endpoint");
			}
		},

		deleteSubscription(id: string): void {
			if (!id) {
				throw new Error("Subscription ID is required");
			}

			try {
				deleteSubscriptionById.run(id);
			} catch (error) {
				console.error("Database error:", error);
				throw new Error("Failed to delete push subscription");
			}
		},

		deleteSubscriptionByEndpoint(endpoint: string): void {
			if (!endpoint) {
				throw new Error("Endpoint is required");
			}

			try {
				deleteSubscriptionByEndpointUrl.run(endpoint);
			} catch (error) {
				console.error("Database error:", error);
				throw new Error("Failed to delete push subscription by endpoint");
			}
		},
	};
};

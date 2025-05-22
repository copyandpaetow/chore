export type PushSubscription = {
	id: string;
	user_id: string;
	details: Object;
	created_at: number;
};

export const pushSubscriptionSchema = `
  CREATE TABLE IF NOT EXISTS push_subscription (
    id TEXT NOT NULL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES user(id),
    details TEXT NOT NULL, -- JSON stringified PushSubscription
    created_at INTEGER NOT NULL
  );
`;

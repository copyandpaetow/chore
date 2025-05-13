import { sha256 } from "@oslojs/crypto/sha2";
import {
	encodeBase32LowerCaseNoPadding,
	encodeHexLowerCase,
} from "@oslojs/encoding";
import { getUserById } from "../user/queries.ts";
import {
	addSession,
	getSession,
	deleteSession,
	updateSession,
} from "./queries.ts";
import { UserSchema } from "../db/user.ts";
import { SessionSchema } from "../db/session.ts";

export type SessionValidationResult =
	| { session: Session; user: User }
	| { session: null; user: null };

export interface Session {
	id: string;
	user_id: string;
	expires_at: Date;
}

export interface User {
	id: number;
}

export const generateSessionToken = (): string => {
	const bytes = new Uint8Array(20);
	crypto.getRandomValues(bytes);
	const token = encodeBase32LowerCaseNoPadding(bytes);
	return token;
};

export const createSession = (token: string, user_id: string): Session => {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: Session = {
		id: sessionId,
		user_id,
		expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
	};
	addSession.run(
		session.id,
		session.user_id,
		Math.floor(session.expires_at.getTime() / 1000)
	);

	return session;
};

export const validateSessionToken = (
	token: string
): SessionValidationResult => {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const row = getSession.get(sessionId) as
		| (Omit<SessionSchema, "id"> & { session_id: string })
		| null;

	if (!row) {
		return { session: null, user: null };
	}
	const session: Session = {
		id: row.session_id,
		user_id: row.user_id,
		expires_at: new Date(row.expires_at * 1000),
	};

	const currentUser = getUserById.get(row.user_id) as UserSchema | undefined;

	if (!currentUser) {
		deleteSession.run(session.id);
		return { session: null, user: null };
	}

	if (Date.now() >= session.expires_at.getTime()) {
		deleteSession.run(session.id);
		return { session: null, user: null };
	}
	if (Date.now() >= session.expires_at.getTime() - 1000 * 60 * 60 * 24 * 15) {
		session.expires_at = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
		updateSession.run(
			Math.floor(session.expires_at.getTime() / 1000),
			session.id
		);
	}
	return { session, user: currentUser };
};

export const invalidateSession = (sessionId: string): void => {
	deleteSession.run(sessionId);
};

export const getCurrentSession = (
	req: Request
): { id: string; userId: number; expires_at: Date } | null => {
	return (req as any).session || null;
};

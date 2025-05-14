import { sha256 } from "@oslojs/crypto/sha2";
import {
	encodeBase32LowerCaseNoPadding,
	encodeHexLowerCase,
} from "@oslojs/encoding";
import { SessionQueries } from "./queries.ts";
import { type Session } from "../db/session.ts";
import { UserQueries } from "../user/queries.ts";

export const generateSessionToken = (): string => {
	const bytes = new Uint8Array(20);
	crypto.getRandomValues(bytes);
	const token = encodeBase32LowerCaseNoPadding(bytes);
	return token;
};

export const createSession = (
	token: string,
	user_id: string,
	sessionQueries: SessionQueries
): Session => {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: Session = {
		id: sessionId,
		user_id,
		expires_at: Date.now() + 1000 * 60 * 60 * 24 * 30,
	};
	sessionQueries.add(
		session.id,
		session.user_id,
		Math.floor(session.expires_at / 1000)
	);

	return session;
};

export const validateSessionToken = (
	token: string,
	userQueries: UserQueries,
	sessionQueries: SessionQueries
) => {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const row = sessionQueries.get(sessionId);

	if (!row) {
		throw new Error("no session");
	}
	const session: Session = {
		...row,
		expires_at: row.expires_at * 1000,
	};

	const currentUser = userQueries.getById(row.user_id);

	if (!currentUser) {
		sessionQueries.delete(session.id);
		throw new Error("no current user");
	}

	if (Date.now() >= session.expires_at) {
		sessionQueries.delete(session.id);
		throw new Error("session expired");
	}
	if (Date.now() >= session.expires_at - 1000 * 60 * 60 * 24 * 15) {
		session.expires_at = Date.now() + 1000 * 60 * 60 * 24 * 30;
		sessionQueries.update(session.id, Math.floor(session.expires_at / 1000));
	}
	return { session, user: currentUser };
};

export const getCurrentSession = (
	req: Request
): { id: string; userId: number; expires_at: Date } | null => {
	return (req as any).session || null;
};

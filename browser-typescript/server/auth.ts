// This module implements the trivial mock authentication logic for the server.
// It is for demonstration purposes only and should not be used in production.

interface LoginResult {
	username: string;
	sessionId: string;
}

const sessionStorage = new Map<string, string>();

export async function login(
	username: string,
	password: string
): Promise<LoginResult | null> {
	if (username === "marco" && password === "polo") {
		const sessionId = Math.random().toString(36).slice(2);
		sessionStorage.set(sessionId, username);
		return { username: "marco", sessionId };
	}
	return null;
}

export async function getUserFromSession(
	sessionId: string | undefined
): Promise<string | undefined> {
	if (!sessionId) return undefined;
	return sessionStorage.get(sessionId);
}

export async function logout(sessionId: string | undefined): Promise<void> {
	if (sessionId) {
		sessionStorage.delete(sessionId);
	}
}

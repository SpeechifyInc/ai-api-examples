// This module implements the trivial mock authentication logic for the server.
// It is for demonstration purposes only and should not be used in production.

const sessionStorage = new Map();

export function login(username, password) {
	if (username === "marco" && password === "polo") {
		const sessionId = Math.random().toString(36).slice(2);
		sessionStorage.set(sessionId, username);
		return { username: "marco", sessionId };
	}
	return null;
}

export function getUserFromSession(sessionId) {
	return sessionStorage.get(sessionId);
}

export function logout(sessionId) {
	sessionStorage.delete(sessionId);
}

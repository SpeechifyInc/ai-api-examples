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

// This module implements the authentication logic for the application,
// using SQLite as a simple database to store session information.
// It is for demonstration purposes only and should not be used in production.

import Database from "better-sqlite3";

const db = new Database("sessions.db");
const initDbStatement = db.prepare(
	"CREATE TABLE IF NOT EXISTS sessions (sessionId TEXT PRIMARY KEY, username TEXT);"
);
initDbStatement.run();
const insertSessionStatement = db.prepare(
	"INSERT INTO sessions (sessionId, username) VALUES (?, ?);"
);
const getSessionStatement = db.prepare(
	"SELECT username FROM sessions WHERE sessionId = ?;"
);
const deleteSessionStatement = db.prepare(
	"DELETE FROM sessions WHERE sessionId = ?;"
);

export function login(username, password) {
	if (username === "marco" && password === "polo") {
		const sessionId = Math.random().toString(36).slice(2);
		if (insertSessionStatement.run(sessionId, username).changes === 1) {
			return { username, sessionId };
		}
	}
	return null;
}

export function getUserFromSession(sessionId) {
	return getSessionStatement.get(sessionId)?.username;
}

export function logout(sessionId) {
	return deleteSessionStatement.run(sessionId).changes === 1;
}

// This module implements the trivial authentication logic for the client.
// It is for demonstration purposes only and should not be used in production.

// The timeout ID for the token refresh interval
let tokenRefreshTimeout;
// The access token that is used to authenticate the client with the Speechify AI API
let authToken;

// The function to get the access token
export function getAuthToken() {
	return authToken;
}

// The function to refresh the access token
export async function refreshToken() {
	// Request a new access token from the server
	const res = await fetch("/api/token", {
		method: "POST",
	});
	if (res.status === 200) {
		const { token } = await res.json();
		// Set the access token and schedule the next token refresh
		authToken = token;
		// Refresh the token every 30 minutes.
		// This is a simple way to ensure that the client has a valid access token.
		// Each token has a limited lifetime, and the client must refresh it before it expires.
		// The actual token lifetime is determined by the Speechify AI API
		// and returned as the `expires_in`, set in seconds.
		tokenRefreshTimeout = setTimeout(refreshToken, 30 * 60 * 1000);
	} else {
		authToken = null;
	}
}

// The function to check the authentication status
export async function checkAuth() {
	const res = await fetch("/auth/me");
	if (res.status === 200) {
		// If the user is authenticated, request/refresh the access token
		await refreshToken();
		return res.json();
	}
	return null;
}

// The function to log in
export async function login(username, password) {
	const res = await fetch("/auth/login", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ username, password }),
	});
	if (res.status === 200) {
		// If the login is successful, request/refresh the access token
		await refreshToken();
		return res.json();
	}
	return null;
}

// The function to log out
export async function logout() {
	const res = await fetch("/auth/logout", {
		method: "POST",
	});
	if (res.status === 200) {
		// If the logout is successful, clear the access token and the token refresh interval
		authToken = null;
		clearTimeout(tokenRefreshTimeout);
		return true;
	}
	return false;
}

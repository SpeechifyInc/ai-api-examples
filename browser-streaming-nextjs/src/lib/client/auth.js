import { createContext, useCallback, useEffect, useRef, useState } from "react";

export function useAuth() {
	const [user, setUser] = useState(undefined);

	// The timeout ID for the token refresh interval
	const tokenRefreshTimeout = useRef(null);
	// The access token that is used to authenticate the client with the Speechify AI API
	const [authToken, setAuthToken] = useState(null);

	// The function to refresh the access token
	const refreshToken = useCallback(async () => {
		// Request a new access token from the server
		const res = await fetch("/api/token", {
			method: "POST",
		});
		if (res.status === 200) {
			const { token } = await res.json();
			// Set the access token and schedule the next token refresh
			setAuthToken(token);
			// Refresh the token every 30 minutes.
			// This is a simple way to ensure that the client has a valid access token.
			// Each token has a limited lifetime, and the client must refresh it before it expires.
			// The actual token lifetime is determined by the Speechify AI API
			// and returned as the `expires_in`, set in seconds.
			tokenRefreshTimeout.current = setTimeout(refreshToken, 30 * 60 * 1000);
		} else {
			setAuthToken(null);
		}
	}, []);

	// The function to check the authentication status
	const checkAuth = useCallback(async () => {
		const res = await fetch("/auth/me");
		if (res.status === 200) {
			// If the user is authenticated, request/refresh the access token
			await refreshToken();
			return res.json();
		}
		return null;
	}, [refreshToken]);

	// The function to log in
	const login = useCallback(
		async (username, password) => {
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
		},
		[refreshToken]
	);

	// The function to log out
	const logout = useCallback(async () => {
		const res = await fetch("/auth/logout", {
			method: "POST",
		});
		if (res.status === 200) {
			// If the logout is successful, clear the access token and the token refresh interval
			setAuthToken(null);
			clearTimeout(tokenRefreshTimeout.current);
			return true;
		}
		return false;
	}, []);

	// Check the authentication status when the hook is called
	useEffect(() => {
		checkAuth().then(setUser);

		return () => {
			clearTimeout(tokenRefreshTimeout.current);
		};
	}, [checkAuth]);

	// Return the user object and the login/logout functions
	return {
		user,
		authToken,
		login: async (username, password) => {
			const res = await login(username, password);
			setUser(res);
		},
		logout: async () => {
			const res = await logout();
			if (res) {
				setUser(null);
			}
		},
	};
}

// The context provider for the authentication state and functions
export const AuthContext = createContext({
	user: undefined,
	authToken: null,
	login: () => {},
	logout: () => {},
});

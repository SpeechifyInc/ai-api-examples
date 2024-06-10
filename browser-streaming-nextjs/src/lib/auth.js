import { createContext, useCallback, useEffect, useRef, useState } from "react";

export function useAuth() {
	const [auth, setAuth] = useState(undefined);

	const tokenRefreshTimeout = useRef(null);
	const [authToken, setAuthToken] = useState(null);

	const refreshToken = useCallback(async () => {
		const res = await fetch("/api/token", {
			method: "POST",
		});
		if (res.status === 200) {
			const { token } = await res.json();
			setAuthToken(token);
			tokenRefreshTimeout.current = setTimeout(refreshToken, 30 * 60 * 1000);
		} else {
			setAuthToken(null);
		}
	}, []);

	const checkAuth = useCallback(async () => {
		const res = await fetch("/auth/me");
		if (res.status === 200) {
			await refreshToken();
			return res.json();
		}
		return null;
	}, [refreshToken]);

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
				await refreshToken();
				return res.json();
			}
			return null;
		},
		[refreshToken]
	);

	const logout = useCallback(async () => {
		const res = await fetch("/auth/logout", {
			method: "POST",
		});
		if (res.status === 200) {
			clearTimeout(tokenRefreshTimeout.current);
			return true;
		}
		return false;
	}, []);

	useEffect(() => {
		checkAuth().then(setAuth);

		return () => {
			clearTimeout(tokenRefreshTimeout.current);
		};
	}, [checkAuth]);

	return {
		auth,
		login: async (username, password) => {
			const res = await login(username, password);
			setAuth(res);
		},
		logout: async () => {
			const res = await logout();
			if (res) {
				setAuth(null);
			}
		},
		authToken,
	};
}

export const AuthContext = createContext({
	auth: undefined,
	login: () => {},
	logout: () => {},
	authToken: "",
});

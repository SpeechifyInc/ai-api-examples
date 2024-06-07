let tokenRefreshTimeout;
let authToken;

export function getAuthToken() {
	return authToken;
}

export async function refreshToken() {
	const res = await fetch("/api/token", {
		method: "POST",
	});
	if (res.status === 200) {
		const { token } = await res.json();
		authToken = token;
		tokenRefreshTimeout = setTimeout(refreshToken, 30 * 60 * 1000);
	} else {
		authToken = null;
	}
}

export async function checkAuth() {
	const res = await fetch("/auth/me");
	if (res.status === 200) {
		await refreshToken();
		return res.json();
	}
	return null;
}

export async function login(username, password) {
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
}

export async function logout() {
	const res = await fetch("/auth/logout", {
		method: "POST",
	});
	if (res.status === 200) {
		clearTimeout(tokenRefreshTimeout);
		return true;
	}
	return false;
}

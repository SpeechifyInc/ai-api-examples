// This module implements the trivial authentication logic for the client.
// It is for demonstration purposes only and should not be used in production.

export interface AuthUser {
	username: string;
}

// The function to check the authentication status
export async function checkAuth(): Promise<AuthUser | null> {
	const res = await fetch("/auth/me");
	if (res.status === 200) {
		return res.json() as Promise<AuthUser>;
	}
	return null;
}

// The function to log in
export async function login(
	username: string,
	password: string
): Promise<AuthUser | null> {
	const res = await fetch("/auth/login", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ username, password }),
	});
	if (res.status === 200) {
		return res.json() as Promise<AuthUser>;
	}
	return null;
}

// The function to log out
export async function logout(): Promise<boolean> {
	const res = await fetch("/auth/logout", {
		method: "POST",
	});
	return res.status === 200;
}

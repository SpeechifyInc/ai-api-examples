export async function checkAuth() {
	const res = await fetch("/auth/me");
	if (res.status === 200) {
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
		return res.json();
	}
	return null;
}

export async function logout() {
	const res = await fetch("/auth/logout", {
		method: "POST",
	});
	if (res.status === 200) {
		return true;
	}
	return false;
}

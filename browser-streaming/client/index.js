async function checkAuth() {
	const res = await fetch("/auth/me");
	if (res.status === 200) {
		return true;
	}
	return false;
}

checkAuth().then((auth) => {
	if (!auth) {
		console.log("Not authenticated");
	}
});

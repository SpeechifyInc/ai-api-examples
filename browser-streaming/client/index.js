async function checkAuth() {
	const res = await fetch("/auth/me");
	if (res.status === 200) {
		return true;
	}
	return false;
}

const loginView = document.querySelector("#login-view");
const loginForm = document.querySelector("#login-form");
const mainView = document.querySelector("#main-view");

function toggleView(view) {
	loginView.classList.add("hidden");
	mainView.classList.add("hidden");
	view.classList.remove("hidden");
}

function init() {
	loginForm.addEventListener("submit", async (e) => {
		e.preventDefault();
		const formData = new FormData(loginForm);
		const username = formData.get("username");
		const password = formData.get("password");
		const res = await fetch("/auth/login", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ username, password }),
		});
		if (res.status === 200) {
			toggleView(mainView);
		}
	});

	checkAuth().then((auth) => {
		toggleView(auth ? mainView : loginView);
	});
}

init();

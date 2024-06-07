import { checkAuth, login, logout } from "./auth.js";

const loginView = document.querySelector("#login-view");
const loginForm = document.querySelector("#login-form");
const logoutForm = document.querySelector("#logout-form");
const mainView = document.querySelector("#main-view");
const usernameView = document.querySelector("#username-view");

function toggleView(auth) {
	loginView.classList.add("hidden");
	mainView.classList.add("hidden");
	if (auth) {
		mainView.classList.remove("hidden");
		usernameView.textContent = auth.username;
	} else {
		loginView.classList.remove("hidden");
	}
}

function init() {
	loginForm.addEventListener("submit", async (e) => {
		e.preventDefault();

		const formData = new FormData(loginForm);
		const username = formData.get("username");
		const password = formData.get("password");

		const auth = await login(username, password);
		toggleView(auth);
	});

	logoutForm.addEventListener("submit", async (e) => {
		e.preventDefault();

		const res = await logout();
		if (res === true) {
			toggleView(null);
		}
	});

	checkAuth().then((auth) => {
		toggleView(auth);
	});
}

init();

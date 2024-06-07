import { checkAuth, login, logout, getAuthToken } from "./auth.js";

const AUDIO_MIME_TYPE = "audio/mpeg";

const loginView = document.querySelector("#login-view");
const loginForm = document.querySelector("#login-form");
const logoutForm = document.querySelector("#logout-form");
const mainView = document.querySelector("#main-view");
const usernameView = document.querySelector("#username-view");
const ttsForm = document.querySelector("#tts-form");
const audioPlayer = document.querySelector("#audio-player");

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

function getAudioStream(inputText) {
	const speechifyHost =
		import.meta.env.VITE_SPEECHIFY_API || "https://api.sws.speechify.com";
	const speechifyAuthToken = getAuthToken();

	if (!speechifyAuthToken) {
		console.error("Unauthorized");
		return;
	}

	return fetch(`${speechifyHost}/v1/audio/stream`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${speechifyAuthToken}`,
			"Content-Type": "application/json",
			Accept: AUDIO_MIME_TYPE,
		},
		body: JSON.stringify({
			input: inputText,
			voice_id: "cliff",
		}),
	});
}

const mediaSource = new MediaSource();
audioPlayer.src = URL.createObjectURL(mediaSource);
let sourceBuffer;

async function playAudioStream(inputText) {
	if (!sourceBuffer) {
		sourceBuffer = mediaSource.addSourceBuffer(AUDIO_MIME_TYPE);
	}

	const audioStreamRes = await getAudioStream(inputText);
	if (!audioStreamRes.ok) {
		console.error("Network response was not ok");
		return;
	}
	if (!audioStreamRes.body) {
		console.error("Response body is null");
		return;
	}

	const reader = audioStreamRes.body.getReader();
	let isFirstChunk = true;
	while (true) {
		const { done, value } = await reader.read();

		if (done) {
			break;
		}

		if (isFirstChunk) {
			isFirstChunk = false;
			audioPlayer.classList.remove("hidden");
			audioPlayer.play();
		}

		sourceBuffer.appendBuffer(value);
	}
}

async function runTextToSpeech() {
	const formData = new FormData(ttsForm);
	const inputText = formData.get("input");

	if (!inputText) {
		return;
	}

	if (mediaSource.readyState === "open") {
		playAudioStream(inputText);
	} else {
		mediaSource.addEventListener("sourceopen", () => {
			playAudioStream(inputText);
		});
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

	ttsForm.addEventListener("submit", async (e) => {
		e.preventDefault();

		runTextToSpeech();
	});
}

init();

import { checkAuth, login, logout, getAuthToken } from "./auth.js";

// The MIME type of the audio stream
const AUDIO_MIME_TYPE = "audio/mpeg";

// DOM elements to interact with
const loginView = document.querySelector("#login-view");
const loginForm = document.querySelector("#login-form");
const logoutForm = document.querySelector("#logout-form");
const mainView = document.querySelector("#main-view");
const usernameView = document.querySelector("#username-view");
const ttsForm = document.querySelector("#tts-form");
const audioPlayer = document.querySelector("#audio-player");

// Function to toggle the view between login and main, based on the authentication status
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

// Function to get the audio stream from the Speechify AI API
function getAudioStream(inputText) {
	// You can ignore this line, unless you know that you want
	// to use a different Speechify API host
	const speechifyHost =
		import.meta.env.VITE_SPEECHIFY_API || "https://api.sws.speechify.com";
	// This is the access token that you obtained from the /api/token route
	const speechifyAuthToken = getAuthToken();

	if (!speechifyAuthToken) {
		console.error("Unauthorized");
		return;
	}

	// Request the audio stream _directly_ from the Speechify AI API.
	// This is the most efficient way to stream audio from the Speechify AI API,
	// made possible thanks to the access token.
	return fetch(`${speechifyHost}/v1/audio/stream`, {
		method: "POST",
		headers: {
			// The Authorization header should contain the access token
			Authorization: `Bearer ${speechifyAuthToken}`,
			// The payload is JSON
			"Content-Type": "application/json",
			// The expected MIME type of the audio stream
			Accept: AUDIO_MIME_TYPE,
		},
		body: JSON.stringify({
			input: inputText,
			voice_id: "cliff",
		}),
	});
}

// The MediaSource interface of the Media Source Extensions API
// https://developer.mozilla.org/en-US/docs/Web/API/MediaSource
const mediaSource = new MediaSource();
// Bind the audio player to the media source
audioPlayer.src = URL.createObjectURL(mediaSource);
// The source buffer to append the audio stream chunks
// https://developer.mozilla.org/en-US/docs/Web/API/SourceBuffer
let sourceBuffer;

async function playAudioStream(inputText) {
	// Create a new source buffer if it doesn't exist.
	// Set the MIME type of the source buffer to the audio MIME type.
	if (!sourceBuffer) {
		sourceBuffer = mediaSource.addSourceBuffer(AUDIO_MIME_TYPE);
	}

	// Fetch the audio stream from the Speechify AI API
	const audioStreamRes = await getAudioStream(inputText);
	if (!audioStreamRes.ok) {
		console.error("Network response was not ok");
		return;
	}
	if (!audioStreamRes.body) {
		console.error("Response body is null");
		return;
	}

	// Read the audio stream as a ReadableStream
	const reader = audioStreamRes.body.getReader();
	let isFirstChunk = true;
	while (true) {
		const { done, value } = await reader.read();

		if (done) {
			break;
		}

		// Append the audio stream chunk to the source buffer
		sourceBuffer.appendBuffer(value);

		// Start playing the audio stream when the first chunk is received
		if (isFirstChunk) {
			isFirstChunk = false;
			audioPlayer.classList.remove("hidden");
			audioPlayer.play();
		}

		// Wait for the source buffer to finish updating before appending the next chunk
		await new Promise((resolve) => {
			sourceBuffer.onupdateend = resolve;
		});
	}
}

async function runTextToSpeech() {
	const formData = new FormData(ttsForm);
	const inputText = formData.get("input");

	if (!inputText) {
		return;
	}

	// Ensure the media source is open before playing the audio stream
	if (mediaSource.readyState === "open") {
		playAudioStream(inputText);
	} else {
		mediaSource.addEventListener("sourceopen", () => {
			playAudioStream(inputText);
		});
	}
}

function init() {
	// Event listeners for the login, logout, and text-to-speech forms

	// Login form event listener
	loginForm.addEventListener("submit", async (e) => {
		e.preventDefault();

		const formData = new FormData(loginForm);
		const username = formData.get("username");
		const password = formData.get("password");

		const auth = await login(username, password);
		// If the login is successful, toggle the view to the main view
		toggleView(auth);
	});

	// Logout form event listener
	logoutForm.addEventListener("submit", async (e) => {
		e.preventDefault();

		const res = await logout();
		if (res === true) {
			// If the logout is successful, toggle the view to the login view
			toggleView(null);
		}
	});

	// Check the authentication status on page load
	checkAuth().then((auth) => {
		// Toggle the view based on the authentication status
		toggleView(auth);
	});

	// Text-to-speech form event listener
	ttsForm.addEventListener("submit", async (e) => {
		e.preventDefault();

		runTextToSpeech();
	});
}

// Initialize the application
init();

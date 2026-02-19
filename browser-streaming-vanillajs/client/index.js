import { checkAuth, login, logout, getAuthToken } from "./auth.js";

// The MIME type of the audio stream
const AUDIO_MIME_TYPE = "audio/mpeg";

// The stream and speech endpoints live on different hosts
const streamHost =
	import.meta.env.VITE_SPEECHIFY_API || "https://api.sws.speechify.com";
const speechHost =
	import.meta.env.VITE_SPEECHIFY_SPEECH_API || "https://api.speechify.ai";

// DOM elements to interact with
const loginView = document.querySelector("#login-view");
const loginForm = document.querySelector("#login-form");
const logoutForm = document.querySelector("#logout-form");
const mainView = document.querySelector("#main-view");
const usernameView = document.querySelector("#username-view");
const ttsForm = document.querySelector("#tts-form");
const audioPlayer = document.querySelector("#audio-player");
const ttsSubmit = document.querySelector("#tts-submit");
const ttsPlayIcon = document.querySelector("#tts-play-icon");
const ttsSpinner = document.querySelector("#tts-spinner");
const ttsBtnLabel = document.querySelector("#tts-btn-label");
let currentMode = "stream";

function setConverting(loading) {
	ttsSubmit.disabled = loading;
	ttsPlayIcon.classList.toggle("hidden", loading);
	ttsSpinner.classList.toggle("hidden", !loading);
	ttsBtnLabel.textContent = loading ? "Converting..." : "Convert to speech";
}

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

function getAuthHeaders() {
	const token = getAuthToken();
	if (!token) return null;
	return {
		Authorization: `Bearer ${token}`,
		"Content-Type": "application/json",
	};
}

// Stream mode: audio arrives as a ReadableStream and is played incrementally
// via the MediaSource Extensions API. A fresh MediaSource is created each call
// so the player can be reused across multiple conversions.
async function playAudioStream(inputText) {
	const headers = getAuthHeaders();
	if (!headers) {
		console.error("Unauthorized");
		setConverting(false);
		return;
	}

	// Create a fresh MediaSource for each stream so repeated calls work
	// https://developer.mozilla.org/en-US/docs/Web/API/MediaSource
	const mediaSource = new MediaSource();
	audioPlayer.src = URL.createObjectURL(mediaSource);

	await new Promise((resolve) =>
		mediaSource.addEventListener("sourceopen", resolve, { once: true })
	);

	// https://developer.mozilla.org/en-US/docs/Web/API/SourceBuffer
	const sourceBuffer = mediaSource.addSourceBuffer(AUDIO_MIME_TYPE);

	const res = await fetch(`${streamHost}/v1/audio/stream`, {
		method: "POST",
		headers: { ...headers, Accept: AUDIO_MIME_TYPE },
		body: JSON.stringify({ input: inputText, voice_id: "cliff" }),
	});

	if (!res.ok) {
		console.error("Network response was not ok");
		setConverting(false);
		return;
	}
	if (!res.body) {
		console.error("Response body is null");
		setConverting(false);
		return;
	}

	// Read the audio stream as a ReadableStream
	const reader = res.body.getReader();
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
			setConverting(false);
			audioPlayer.classList.remove("hidden");
			audioPlayer.play();
		}

		// Wait for the source buffer to finish updating before appending the next chunk
		await new Promise((resolve) => {
			sourceBuffer.onupdateend = resolve;
		});
	}
}

// Speech mode: the full audio is returned as a base64-encoded string in a JSON
// response. The audio is decoded and played once the entire response arrives.
async function playAudioSpeech(inputText) {
	const headers = getAuthHeaders();
	if (!headers) {
		console.error("Unauthorized");
		setConverting(false);
		return;
	}

	const res = await fetch(`${speechHost}/v1/audio/speech`, {
		method: "POST",
		headers,
		body: JSON.stringify({
			input: inputText,
			voice_id: "cliff",
			audio_format: "mp3",
		}),
	});

	if (!res.ok) {
		console.error("Network response was not ok");
		setConverting(false);
		return;
	}

	const { audio_data } = await res.json();

	// Decode the base64 audio data into a Blob URL
	const binary = atob(audio_data);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	const blob = new Blob([bytes], { type: AUDIO_MIME_TYPE });

	setConverting(false);
	audioPlayer.src = URL.createObjectURL(blob);
	audioPlayer.classList.remove("hidden");
	audioPlayer.play();
}

async function runTextToSpeech() {
	const formData = new FormData(ttsForm);
	const inputText = formData.get("input");

	if (!inputText) {
		setConverting(false);
		return;
	}

	if (currentMode === "stream") {
		await playAudioStream(inputText);
	} else {
		await playAudioSpeech(inputText);
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

	// Mode dropdown
	const modeTrigger = document.querySelector("#mode-trigger");
	const modePanel = document.querySelector("#mode-panel");
	const modeLabel = document.querySelector("#mode-label");

	modeTrigger.addEventListener("click", (e) => {
		e.stopPropagation();
		modePanel.classList.toggle("hidden");
	});

	document.querySelectorAll(".mode-option").forEach((btn) => {
		btn.addEventListener("click", () => {
			currentMode = btn.dataset.mode;
			modeLabel.textContent = currentMode === "stream" ? "Stream" : "Speech";
			document.querySelector("#check-stream").classList.toggle("invisible", currentMode !== "stream");
			document.querySelector("#check-speech").classList.toggle("invisible", currentMode !== "speech");
			document.querySelectorAll(".mode-option").forEach((b) => {
				b.classList.toggle("text-white", b === btn);
				b.classList.toggle("text-white/50", b !== btn);
			});
			modePanel.classList.add("hidden");
		});
	});

	document.addEventListener("click", () => modePanel.classList.add("hidden"));

	// Text-to-speech form event listener
	ttsForm.addEventListener("submit", async (e) => {
		e.preventDefault();

		setConverting(true);
		runTextToSpeech();
	});
}

// Initialize the application
init();

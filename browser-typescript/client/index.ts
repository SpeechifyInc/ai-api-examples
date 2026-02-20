import { checkAuth, login, logout, type AuthUser } from "./auth.ts";

// The MIME type of the audio stream
const AUDIO_MIME_TYPE = "audio/mpeg";

// DOM elements to interact with
const loginView = document.querySelector<HTMLDivElement>("#login-view")!;
const loginForm = document.querySelector<HTMLFormElement>("#login-form")!;
const logoutForm = document.querySelector<HTMLFormElement>("#logout-form")!;
const mainView = document.querySelector<HTMLDivElement>("#main-view")!;
const usernameView = document.querySelector<HTMLSpanElement>("#username-view")!;
const ttsForm = document.querySelector<HTMLFormElement>("#tts-form")!;
const audioPlayer = document.querySelector<HTMLAudioElement>("#audio-player")!;
const ttsSubmit = document.querySelector<HTMLButtonElement>("#tts-submit")!;
const ttsPlayIcon = document.querySelector<SVGSVGElement>("#tts-play-icon")!;
const ttsSpinner = document.querySelector<SVGSVGElement>("#tts-spinner")!;
const ttsBtnLabel = document.querySelector<HTMLSpanElement>("#tts-btn-label")!;
let currentMode = "stream";

function setConverting(loading: boolean): void {
	ttsSubmit.disabled = loading;
	ttsPlayIcon.classList.toggle("hidden", loading);
	ttsSpinner.classList.toggle("hidden", !loading);
	ttsBtnLabel.textContent = loading ? "Converting..." : "Convert to speech";
}

// Function to toggle the view between login and main, based on the authentication status
function toggleView(auth: AuthUser | null): void {
	loginView.classList.add("hidden");
	mainView.classList.add("hidden");
	if (auth) {
		mainView.classList.remove("hidden");
		usernameView.textContent = auth.username;
	} else {
		loginView.classList.remove("hidden");
	}
}

// Stream mode: audio arrives as a ReadableStream and is played incrementally
// via the MediaSource Extensions API. A fresh MediaSource is created each call
// so the player can be reused across multiple conversions.
async function playAudioStream(inputText: string): Promise<void> {
	// Create a fresh MediaSource for each stream so repeated calls work
	// https://developer.mozilla.org/en-US/docs/Web/API/MediaSource
	const mediaSource = new MediaSource();
	audioPlayer.src = URL.createObjectURL(mediaSource);

	await new Promise<void>((resolve) =>
		mediaSource.addEventListener("sourceopen", () => resolve(), { once: true })
	);

	// https://developer.mozilla.org/en-US/docs/Web/API/SourceBuffer
	const sourceBuffer = mediaSource.addSourceBuffer(AUDIO_MIME_TYPE);

	const res = await fetch("/api/audio/stream", {
		method: "POST",
		headers: { "Content-Type": "application/json", Accept: AUDIO_MIME_TYPE },
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
		await new Promise<void>((resolve) => {
			sourceBuffer.onupdateend = () => resolve();
		});
	}
}

// Speech mode: the full audio is returned as a base64-encoded string in a JSON
// response. The audio is decoded and played once the entire response arrives.
async function playAudioSpeech(inputText: string): Promise<void> {
	const res = await fetch("/api/audio/speech", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
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

	const { audio_data } = (await res.json()) as { audio_data: string };

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

async function runTextToSpeech(): Promise<void> {
	const formData = new FormData(ttsForm);
	const inputText = formData.get("input") as string | null;

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

function init(): void {
	// Event listeners for the login, logout, and text-to-speech forms

	// Login form event listener
	loginForm.addEventListener("submit", async (e: Event) => {
		e.preventDefault();

		const formData = new FormData(loginForm);
		const username = formData.get("username") as string;
		const password = formData.get("password") as string;

		const auth = await login(username, password);
		// If the login is successful, toggle the view to the main view
		toggleView(auth);
	});

	// Logout form event listener
	logoutForm.addEventListener("submit", async (e: Event) => {
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
	const modeTrigger = document.querySelector<HTMLButtonElement>("#mode-trigger")!;
	const modePanel = document.querySelector<HTMLDivElement>("#mode-panel")!;
	const modeLabel = document.querySelector<HTMLSpanElement>("#mode-label")!;

	modeTrigger.addEventListener("click", (e: MouseEvent) => {
		e.stopPropagation();
		modePanel.classList.toggle("hidden");
	});

	document.querySelectorAll<HTMLButtonElement>(".mode-option").forEach((btn) => {
		btn.addEventListener("click", () => {
			currentMode = btn.dataset.mode ?? "stream";
			modeLabel.textContent = currentMode === "stream" ? "Stream" : "Speech";
			document
				.querySelector<SVGElement>("#check-stream")!
				.classList.toggle("invisible", currentMode !== "stream");
			document
				.querySelector<SVGElement>("#check-speech")!
				.classList.toggle("invisible", currentMode !== "speech");
			document.querySelectorAll<HTMLButtonElement>(".mode-option").forEach((b) => {
				b.classList.toggle("text-white", b === btn);
				b.classList.toggle("text-white/50", b !== btn);
			});
			modePanel.classList.add("hidden");
		});
	});

	document.addEventListener("click", () => modePanel.classList.add("hidden"));

	// Text-to-speech form event listener
	ttsForm.addEventListener("submit", async (e: Event) => {
		e.preventDefault();

		setConverting(true);
		runTextToSpeech();
	});
}

// Initialize the application
init();

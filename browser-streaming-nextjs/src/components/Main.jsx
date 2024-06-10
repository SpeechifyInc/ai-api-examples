import { useRef, useContext, useState, useEffect } from "react";

import { AuthContext } from "@/lib/client/auth";
import { Logout } from "./Logout";

// The MIME type of the audio stream
const AUDIO_MIME_TYPE = "audio/mpeg";

// Function to get the audio stream from the Speechify AI API
function getAudioStream(speechifyAuthToken, inputText) {
	// You can ignore this line, unless you know that you want
	// to use a different Speechify API host
	const speechifyHost =
		process.env.NEXT_PUBLIC_SPEECHIFY_API || "https://api.sws.speechify.com";

	// Use the access token that you obtained from the /api/token route
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

async function playAudioStream(
	sourceBuffer,
	audioPlayer,
	speechifyAuthToken,
	inputText
) {
	// Fetch the audio stream from the Speechify AI API
	const audioStreamRes = await getAudioStream(speechifyAuthToken, inputText);
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

		// Start playing the audio stream when the first chunk is received
		if (isFirstChunk) {
			isFirstChunk = false;
			audioPlayer.play();
		}

		// Append the audio stream chunk to the source buffer
		sourceBuffer.appendBuffer(value);
	}
}

async function runTextToSpeech(
	mediaSource,
	sourceBuffer,
	audioPlayer,
	speechifyAuthToken,
	inputText
) {
	if (!inputText) {
		return;
	}

	const play = () => {
		playAudioStream(sourceBuffer, audioPlayer, speechifyAuthToken, inputText);
	};

	// Ensure the media source is open before playing the audio stream
	if (mediaSource.readyState === "open") {
		play();
	} else {
		mediaSource.addEventListener("sourceopen", play);
	}
}

export function Main() {
	const { user, authToken } = useContext(AuthContext);

	const [input, setInput] = useState(
		`The Best Text to Speech Converter. Listen up to 9x faster with
Speechify’s ultra realistic text to speech software that lets you read
faster than the average reading speed, without skipping out on the
best AI voices.`
	);

	const [showAudio, setShowAudio] = useState(false);
	// Reference to the <audio> HTML element
	const audioRef = useRef();
	// The MediaSource interface of the Media Source Extensions API
	// https://developer.mozilla.org/en-US/docs/Web/API/MediaSource
	const mediaSourceRef = useRef(new MediaSource());
	// The source buffer to append the audio stream chunks
	// https://developer.mozilla.org/en-US/docs/Web/API/SourceBuffer
	const sourceBufferRef = useRef(null);

	useEffect(() => {
		// Bind the audio player to the media source
		if (audioRef.current) {
			audioRef.current.src = URL.createObjectURL(mediaSourceRef.current);
		}
	}, []);

	return (
		<div>
			<div className="flex gap-2 items-center justify-end">
				<p>
					Hello, <span>{user.username}</span>
				</p>
				<Logout />
			</div>

			<hr className="my-4 border border-gray-400" />

			<form
				onSubmit={(e) => {
					e.preventDefault();

					// Create a new source buffer if it doesn't exist.
					// Set the MIME type of the source buffer to the audio MIME type.
					if (!sourceBufferRef.current) {
						try {
							sourceBufferRef.current =
								mediaSourceRef.current.addSourceBuffer(AUDIO_MIME_TYPE);
						} catch (error) {
							console.warn(
								"Error adding source buffer, it likely already exists:",
								error
							);
						}
					}

					if (!input) {
						return;
					}

					// Toggle the display of the audio player
					setShowAudio(true);

					runTextToSpeech(
						mediaSourceRef.current,
						sourceBufferRef.current,
						audioRef.current,
						authToken,
						input
					);
				}}
			>
				<textarea
					name="input"
					placeholder="Type your text here"
					className="w-full rounded py-3 px-2"
					rows="8"
					value={input}
					onChange={(e) => setInput(e.target.value)}
				/>
				<button
					type="submit"
					className="mt-2 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
				>
					Convert text to speech
				</button>
			</form>

			{/* biome-ignore lint/a11y/useMediaCaption: */}
			<audio
				ref={audioRef}
				controls
				className={`mt-6 w-full${showAudio ? "" : " hidden"}`}
			/>
		</div>
	);
}

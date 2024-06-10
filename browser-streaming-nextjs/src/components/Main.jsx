import { useRef, useContext, useState, useEffect } from "react";

import { AuthContext } from "@/lib/auth";
import { Logout } from "./Logout";

const AUDIO_MIME_TYPE = "audio/mpeg";

function getAudioStream(speechifyAuthToken, inputText) {
	const speechifyHost =
		process.env.NEXT_PUBLIC_SPEECHIFY_API || "https://api.sws.speechify.com";

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

async function playAudioStream(
	sourceBuffer,
	audioPlayer,
	speechifyAuthToken,
	inputText
) {
	const audioStreamRes = await getAudioStream(speechifyAuthToken, inputText);
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
			audioPlayer.play();
		}

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

	if (mediaSource.readyState === "open") {
		play();
	} else {
		mediaSource.addEventListener("sourceopen", play);
	}
}

export function Main() {
	const { auth, authToken } = useContext(AuthContext);

	const [input, setInput] = useState(
		`The Best Text to Speech Converter. Listen up to 9x faster with
Speechify’s ultra realistic text to speech software that lets you read
faster than the average reading speed, without skipping out on the
best AI voices.`
	);

	const [showAudio, setShowAudio] = useState(false);
	const audioRef = useRef();
	const mediaSourceRef = useRef(new MediaSource());
	const sourceBufferRef = useRef(null);

	useEffect(() => {
		if (audioRef.current && !audioRef.current.src) {
			audioRef.current.src = URL.createObjectURL(mediaSourceRef.current);
		}
	}, []);

	return (
		<div>
			<div className="flex gap-2 items-center justify-end">
				<p>
					Hello, <span>{auth.username}</span>
				</p>
				<Logout />
			</div>

			<hr className="my-4 border border-gray-400" />

			<form
				onSubmit={(e) => {
					e.preventDefault();

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

			{/* biome-ignore lint/a11y/useMediaCaption: <explanation> */}
			<audio
				ref={audioRef}
				controls
				className={`mt-6 w-full${showAudio ? "" : " hidden"}`}
			/>
		</div>
	);
}

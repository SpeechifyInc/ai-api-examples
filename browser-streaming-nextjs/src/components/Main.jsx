import { useRef, useContext } from "react";

import { AuthContext } from "@/lib/auth";
import { Logout } from "./Logout";

export function Main() {
	const audioRef = useRef();
	const { auth } = useContext(AuthContext);

	return (
		<div>
			<div className="flex gap-2 items-center justify-end">
				<p>
					Hello, <span>{auth.username}</span>
				</p>
				<Logout />
			</div>

			<hr className="my-4 border border-gray-400" />

			<form>
				<textarea
					name="input"
					placeholder="Type your text here"
					className="w-full rounded py-3 px-2"
					rows="8"
				>
					The Best Text to Speech Converter. Listen up to 9x faster with
					Speechify’s ultra realistic text to speech software that lets you read
					faster than the average reading speed, without skipping out on the
					best AI voices.
				</textarea>
				<button
					type="submit"
					className="mt-2 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
				>
					Convert text to speech
				</button>
			</form>

			{/* biome-ignore lint/a11y/useMediaCaption: <explanation> */}
			<audio ref={audioRef} controls className="hidden mt-6 w-full" />
		</div>
	);
}

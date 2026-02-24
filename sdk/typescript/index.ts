import "dotenv/config";
import { SpeechifyClient } from "@speechify/api";
import fs from "fs";

const client = new SpeechifyClient(); // uses SPEECHIFY_API_KEY env var

const response = await client.tts.audio.speech({
	input: "Welcome to Speechify!",
	voiceId: "george",
	audioFormat: "mp3",
});

fs.writeFileSync("output.mp3", Buffer.from(response.audioData, "base64"));
console.log("Audio saved to output.mp3");

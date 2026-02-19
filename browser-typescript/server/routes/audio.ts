import { Readable } from "node:stream";
import type { ReadableStream as WebReadableStream } from "node:stream/web";

import { Router, type Request, type Response } from "express";

import { getUserFromSession } from "../auth.ts";

const AUDIO_MIME_TYPE = "audio/mpeg";

const speechifyHost =
	process.env.SPEECHIFY_API ?? "https://api.speechify.ai";

// Server-side token cache — the Speechify access token is obtained once and
// reused until it is about to expire. This avoids an extra round-trip for
// every audio request while still keeping the API key confined to the server.
let cachedToken: string | null = null;
let tokenExpiry = 0;

export const audioRouter = Router();

async function getSpeechifyToken(): Promise<string> {
	if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

	const res = await fetch(`${speechifyHost}/v1/auth/token`, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			Authorization: `Bearer ${process.env.SPEECHIFY_API_KEY}`,
		},
		body: new URLSearchParams({
			grant_type: "client_credentials",
			scope: "audio:stream audio:speech",
		}).toString(),
	});

	if (!res.ok) {
		throw new Error(`Token request failed: ${await res.text()}`);
	}

	const data = (await res.json()) as {
		access_token: string;
		expires_in?: number;
	};
	cachedToken = data.access_token;
	// Refresh 60 seconds before actual expiry to avoid edge cases
	tokenExpiry = Date.now() + ((data.expires_in ?? 1800) - 60) * 1000;
	return cachedToken;
}

// Resolves the session and returns a valid Speechify token, or writes the
// appropriate error response and returns null so the caller can early-return.
async function getToken(req: Request, res: Response): Promise<string | null> {
	const user = await getUserFromSession(
		req.cookies.sessionId as string | undefined
	);
	if (!user) {
		res.status(401).json({ error: "Unauthorized" });
		return null;
	}

	try {
		return await getSpeechifyToken();
	} catch (err) {
		console.error("Failed to get Speechify token:", err);
		res.status(502).json({ error: "Failed to obtain access token" });
		return null;
	}
}

// Proxy the streaming audio endpoint. The response is piped directly from
// the Speechify API back to the client so playback can start immediately.
audioRouter.post("/stream", async (req: Request, res: Response) => {
	const token = await getToken(req, res);
	if (!token) return;

	const apiRes = await fetch(`${speechifyHost}/v1/audio/stream`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
			Accept: AUDIO_MIME_TYPE,
		},
		body: JSON.stringify(req.body),
	});

	if (!apiRes.ok || !apiRes.body) {
		res.status(apiRes.status).json({ error: "Upstream error" });
		return;
	}

	res.setHeader("Content-Type", AUDIO_MIME_TYPE);
	Readable.fromWeb(apiRes.body as WebReadableStream<Uint8Array>).pipe(res);
});

// Proxy the speech endpoint. The full JSON response (including base64 audio)
// is forwarded to the client once the upstream request completes.
audioRouter.post("/speech", async (req: Request, res: Response) => {
	const token = await getToken(req, res);
	if (!token) return;

	const apiRes = await fetch(`${speechifyHost}/v1/audio/speech`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(req.body),
	});

	if (!apiRes.ok) {
		res.status(apiRes.status).json({ error: "Upstream error" });
		return;
	}

	res.json(await apiRes.json());
});

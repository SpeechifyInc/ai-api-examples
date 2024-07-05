import "dotenv/config";

import path from "node:path";
import express from "express";
import cookieParser from "cookie-parser";

import { login, logout, getUserFromSession } from "./auth.js";

const app = express();

app.use(cookieParser("secret"));
app.use(express.json());
app.use(express.static(path.resolve(import.meta.dirname, "../client/dist")));

// AUTHENTICATION ROUTES
// These routes are for demonstration purposes only and should not be used in production.
// You MUST implement proper authentication and session management in a real application
// to ensure the security of your users' data AND to protect your paid Speechify AI API usage.

app.post("/auth/login", async (req, res) => {
	const { username, password } = req.body;
	const loginResponse = await login(username, password);
	if (loginResponse) {
		res
			.cookie("sessionId", loginResponse.sessionId, {
				httpOnly: true,
				secure: true,
				sameSite: "strict",
				expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
			})
			.json({ username: loginResponse.username });
	} else {
		res.status(401).json({ error: "Invalid credentials" });
	}
});

app.post("/auth/logout", async (req, res) => {
	await logout(req.cookies.sessionId);
	res.clearCookie("sessionId").end();
});

app.get("/auth/me", async (req, res) => {
	const user = await getUserFromSession(req.cookies.sessionId);
	if (user) {
		res.json({ username: user });
	} else {
		res.status(401).json({ error: "Unauthorized" });
	}
});

// ACCESS TOKEN ISSUE ROUTE
// You MUST implement the similar route in your SERVER to issue the access token
// for the Speechify AI API.
// The Speechify AI API Key should ONLY be exposed to the server code,
// and the access tokens should only be issued to the authenticated users of your application.

app.post("/api/token", async (req, res) => {
	// Ensure the user is authenticated
	const user = await getUserFromSession(req.cookies.sessionId);
	if (!user) {
		return res.status(401).json({ error: "Unauthorized" });
	}

	// You can ignore this line, unless you know that you want
	// to use a different Speechify API host
	const speechifyHost =
		process.env.SPEECHIFY_API || "https://api.sws.speechify.com";
	// Here, you should use the Speechify API Key that you obtained
	// from the Speechify AI API dashboard
	const speechifyApiKey = process.env.SPEECHIFY_API_KEY;

	// Request the access token from the Speechify AI API
	const apiRes = await fetch(`${speechifyHost}/v1/auth/token`, {
		method: "POST",
		headers: {
			// Per OAuth 2.0 specification, payload should be application/x-www-form-urlencoded
			"Content-Type": "application/x-www-form-urlencoded",
			// The Authorization header should contain the Speechify API Key
			Authorization: `Bearer ${speechifyApiKey}`,
		},
		// Per OAuth 2.0 specification, payload should be application/x-www-form-urlencoded
		body: new URLSearchParams({
			// The grant_type should always be client_credentials
			grant_type: "client_credentials",
			// Always use the minimal scope that is necessary for your application.
			// For example, for the audio streaming it's "audio:stream"
			scope: "audio:stream",
		}).toString(),
	});

	if (apiRes.status !== 200) {
		console.log(`Token error: ${await apiRes.text()}`);
		return res.status(401).json({ error: "Unauthorized" });
	}

	// The API response contains several fields, you can send the whole response to the client
	// but the most important one is the access_token field.
	const tokenData = await apiRes.json();
	res.json({ token: tokenData.access_token });
});

// MAIN ROUTE
// Here we serve the main page of the application

app.get("/", (_req, res) => {
	res.sendFile("index.html");
});

// START SERVER

const port = Number.parseInt(process.env.PORT || 4040);
app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});

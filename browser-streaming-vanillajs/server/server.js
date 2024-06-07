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

app.post("/auth/login", (req, res) => {
	const { username, password } = req.body;
	const loginResponse = login(username, password);
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

app.post("/auth/logout", (req, res) => {
	logout(req.cookies.sessionId);
	res.clearCookie("sessionId").end();
});

app.get("/auth/me", (req, res) => {
	const user = getUserFromSession(req.cookies.sessionId);
	if (user) {
		res.json({ username: user });
	} else {
		res.status(401).json({ error: "Unauthorized" });
	}
});

// API ROUTES

app.post("/api/token", async (req, res) => {
	const user = getUserFromSession(req.cookies.sessionId);
	if (!user) {
		return res.status(401).json({ error: "Unauthorized" });
	}

	const speechifyHost =
		process.env.SPEECHIFY_API || "https://api.sws.speechify.com";
	const speechifyApiKey = process.env.SPEECHIFY_API_KEY;

	const apiRes = await fetch(`${speechifyHost}/v1/auth/token`, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			Authorization: `Bearer ${speechifyApiKey}`,
		},
		body: new URLSearchParams({
			grant_type: "client_credentials",
			scope: "audio:stream",
		}).toString(),
	});

	if (apiRes.status !== 200) {
		console.log(`Token error: ${await apiRes.text()}`);
		return res.status(401).json({ error: "Unauthorized" });
	}

	const tokenData = await apiRes.json();
	res.json({ token: tokenData.access_token });
});

// MAIN ROUTE

app.get("/", (req, res) => {
	res.sendFile("index.html");
});

// START SERVER

const port = Number.parseInt(process.env.PORT || 4040);
app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});

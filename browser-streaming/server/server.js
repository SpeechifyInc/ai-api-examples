import path from "node:path";
import express from "express";

import { login } from "./auth.js";

const app = express();

app.use(express.json());
app.use(express.static(path.resolve(import.meta.dirname, "../client/dist")));

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

app.get("/", (req, res) => {
	res.sendFile("index.html");
});

const port = Number.parseInt(process.env.PORT || 4040);
app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});

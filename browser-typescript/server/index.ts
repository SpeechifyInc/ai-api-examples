import "dotenv/config";

import path from "node:path";
import express, { type Request, type Response } from "express";
import cookieParser from "cookie-parser";

import { authRouter } from "./routes/auth.ts";
import { audioRouter } from "./routes/audio.ts";

const app = express();

app.use(cookieParser("secret"));
app.use(express.json());
app.use(express.static(path.resolve(import.meta.dirname, "../client/dist")));

// Authentication routes: /auth/login, /auth/logout, /auth/me
app.use("/auth", authRouter);

// Audio proxy routes: /api/audio/stream, /api/audio/speech
// All requests are authenticated server-side before being forwarded to Speechify.
app.use("/api/audio", audioRouter);

app.get("/", (_req: Request, res: Response) => {
	res.sendFile("index.html");
});

const port = Number.parseInt(process.env.PORT ?? "4040");
app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});

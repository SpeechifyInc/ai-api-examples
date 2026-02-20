import { Router, type Request, type Response } from "express";

import { login, logout, getUserFromSession } from "../auth.ts";

export const authRouter = Router();

authRouter.post("/login", async (req: Request, res: Response) => {
	const { username, password } = req.body as {
		username: string;
		password: string;
	};
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

authRouter.post("/logout", async (req: Request, res: Response) => {
	await logout(req.cookies.sessionId as string | undefined);
	res.clearCookie("sessionId").end();
});

authRouter.get("/me", async (req: Request, res: Response) => {
	const user = await getUserFromSession(
		req.cookies.sessionId as string | undefined
	);
	if (user) {
		res.json({ username: user });
	} else {
		res.status(401).json({ error: "Unauthorized" });
	}
});

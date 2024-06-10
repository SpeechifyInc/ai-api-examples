import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { login } from "../auth";

export async function POST(req) {
	const { username, password } = await req.json();
	const loginResponse = login(username, password);

	if (loginResponse) {
		const response = NextResponse.json({ username: loginResponse.username });
		response.cookies.set("sessionId", loginResponse.sessionId, {
			httpOnly: true,
			secure: true,
			sameSite: "strict",
			expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
		});
		return response;
	}

	return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
}

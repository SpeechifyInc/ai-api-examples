import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { getUserFromSession } from "../../auth/auth";

export async function POST() {
	const cookieStore = cookies();

	const user = getUserFromSession(cookieStore.get("sessionId").value);
	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const tokenData = await apiRes.json();
	return NextResponse.json({ token: tokenData.access_token });
}

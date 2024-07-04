import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { getUserFromSession } from "../../auth/auth";

// ACCESS TOKEN ISSUE ROUTE
// You MUST implement the similar route in your SERVER to issue the access token
// for the Speechify AI API.
// The Speechify AI API Key should ONLY be exposed to the server code,
// and the access tokens should only be issued to the authenticated users of your application.

export async function POST() {
	const cookieStore = cookies();

	// Ensure the user is authenticated
	const user = await getUserFromSession(cookieStore.get("sessionId")?.value);
	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	// The API response contains several fields, you can send the whole response to the client
	// but the most important one is the access_token field.
	const tokenData = await apiRes.json();
	return NextResponse.json({ token: tokenData.access_token });
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { getUserFromSession } from "../auth";

export async function GET() {
	const cookieStore = cookies();

	const user = getUserFromSession(cookieStore.get("sessionId")?.value);

	if (user) {
		return NextResponse.json({ username: user });
	}

	return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { logout } from "../auth";

export async function POST() {
	const cookieStore = cookies();

	logout(cookieStore.get("sessionId")?.value);

	const response = NextResponse.json({ success: true });
	response.cookies.delete("sessionId");

	return response;
}

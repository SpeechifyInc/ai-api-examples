"use client";

import { AuthContext, useAuth } from "@/lib/auth";
import { Login } from "@/components/Login";
import { Main } from "@/components/Main";

export default function Home() {
	const auth = useAuth();

	if (auth.auth === undefined) {
		return null;
	}

	return (
		<AuthContext.Provider value={auth}>
			{auth.auth === null ? <Login /> : <Main />}
		</AuthContext.Provider>
	);
}

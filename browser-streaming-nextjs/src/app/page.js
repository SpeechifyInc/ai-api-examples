"use client";

import { AuthContext, useAuth } from "@/lib/client/auth";
import { Login } from "@/components/Login";
import { Main } from "@/components/Main";

export default function Home() {
	const auth = useAuth();

	// If the authentication status is not yet determined, don't render anything
	if (auth.user === undefined) {
		return null;
	}

	return (
		// The AuthContext.Provider component provides the authentication state and functions to the child components
		<AuthContext.Provider value={auth}>
			{/* If the user is not authenticated, show the login component */}
			{auth.user === null ? <Login /> : <Main />}
		</AuthContext.Provider>
	);
}

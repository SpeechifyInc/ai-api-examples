import { useContext } from "react";

import { AuthContext } from "@/lib/client/auth";

// The logout form
export function Logout() {
	// Make use of the auth context to call the logout method
	const { logout } = useContext(AuthContext);

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				logout();
			}}
		>
			<button
				type="submit"
				className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
			>
				Logout
			</button>
		</form>
	);
}

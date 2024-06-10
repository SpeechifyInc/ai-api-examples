import { AuthContext } from "@/lib/client/auth";
import { useContext, useState } from "react";

// The login form
export function Login() {
	const [username, setUsername] = useState("marco");
	const [password, setPassword] = useState("polo");

	// Make use of the auth context to call the login method
	const { login } = useContext(AuthContext);

	return (
		<div>
			<h1 className="font-bold text-xl">Login</h1>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					login(username, password);
				}}
			>
				<p className="flex gap-4 pt-4 items-center">
					<label htmlFor="username" className="w-[100px]">
						Login:
					</label>
					<input
						id="username"
						name="username"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						className="px-2 py-1 rounded"
					/>
				</p>
				<p className="flex gap-4 pt-4 items-center">
					<label htmlFor="password" className="w-[100px]">
						Password:
					</label>
					<input
						id="password"
						name="password"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="px-2 py-1 rounded"
					/>
				</p>
				<p className="flex gap-4 pt-4">
					<span className="w-[100px]" />
					<button
						type="submit"
						className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
					>
						Login
					</button>
				</p>
			</form>
		</div>
	);
}

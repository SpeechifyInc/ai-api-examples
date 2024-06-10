import "./globals.css";

export const metadata = {
	title: "Speechify Steaming Demo",
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body className="bg-gray-200 p-8">{children}</body>
		</html>
	);
}

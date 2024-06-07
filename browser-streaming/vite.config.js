import path from "node:path";

/** @type {import('vite').UserConfig} */
export default {
	root: path.join(import.meta.dirname, "client"),
	envDir: import.meta.dirname,
	build: {
		outDir: "dist",
		emptyOutDir: true,
	},
};

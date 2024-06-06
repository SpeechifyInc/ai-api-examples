import path from "node:path";

/** @type {import('vite').UserConfig} */
export default {
	root: path.join(import.meta.dirname, "client"),
	build: {
		outDir: "dist",
		emptyOutDir: true,
	},
};

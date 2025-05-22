import htmlPlugin from "@chialab/esbuild-plugin-html";
import esbuild from "esbuild";

await esbuild.build({
	entryPoints: ["src/pages/**/*.html"],
	outdir: "dist",
	entryNames: "[name]",
	chunkNames: "[ext]/[name]-[hash]",
	plugins: [htmlPlugin()],
	sourcemap: true,
	minify: false,
	bundle: true,
});

import htmlPlugin from "@chialab/esbuild-plugin-html";
import esbuild from "esbuild";

await esbuild.build({
	entryPoints: ["src/pages/**/*.html"],
	outdir: "dist",
	entryNames: "[name]",
	assetNames: "[name]",
	chunkNames: "[ext]/[name]",
	plugins: [htmlPlugin()],
	sourcemap: true,
	minify: false,
	bundle: true,
});

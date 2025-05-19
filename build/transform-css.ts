import fs from "fs/promises";
import path from "path";
//import { transform } from "lightningcss";

async function processCSS(
	sourcePath: string,
	destPath: string,
	minify = true
): Promise<void> {
	try {
		const cssContent = await fs.readFile(sourcePath);

		// const { code } = transform({
		// 	filename: path.basename(sourcePath),
		// 	code: cssContent,
		// 	minify,
		// 	sourceMap: true,
		// });

		await fs.mkdir(path.dirname(destPath), { recursive: true });
		await fs.writeFile(destPath, cssContent);

		console.log(`Processed ${sourcePath} to ${destPath}`);
	} catch (err) {
		if (err.code === "ENOENT") {
			console.warn(`Warning: ${sourcePath} does not exist, skipping`);
		} else {
			console.error(`Error processing ${sourcePath}:`, err);
		}
	}
}

async function buildCSS() {
	const pagesDir = path.join("src", "pages");
	const pagesDirs = await fs.readdir(pagesDir);

	for (const page of pagesDirs) {
		const srcCssPath = path.join(pagesDir, page, "index.css");
		const destCssPath = path.join("public", "pages", page, "index.css");

		await processCSS(srcCssPath, destCssPath);
	}

	const sharedCssDir = path.join("src", "client", "css");
	const destSharedCssDir = path.join("public", "client", "css");

	try {
		const cssFiles = await fs.readdir(sharedCssDir);

		for (const file of cssFiles) {
			if (file.endsWith(".css")) {
				const srcPath = path.join(sharedCssDir, file);
				const destPath = path.join(destSharedCssDir, file);

				await processCSS(srcPath, destPath);
			}
		}
	} catch (err) {
		console.error("Error processing shared CSS:", err);
	}
}

async function build() {
	await buildCSS();
	console.log("CSS build completed!");
}

build().catch(console.error);

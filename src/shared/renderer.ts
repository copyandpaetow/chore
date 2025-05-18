import fs from "fs";
import path from "path";
import { Window } from "happy-dom";

export const renderHTML = async (name: string) => {
	try {
		const templatePath = path.resolve(
			process.cwd(),
			`src/pages/${name}`,
			"template.html"
		);
		const template = fs.readFileSync(templatePath, "utf8");
		const window = new Window({
			innerWidth: 1024,
			innerHeight: 768,
			url: "http://localhost:3000",
		});
		const document = window.document;
		document.write(template);

		await window.happyDOM.waitUntilComplete();

		return document;
	} catch (error) {
		console.warn(error);
	}
};

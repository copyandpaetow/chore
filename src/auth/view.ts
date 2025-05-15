import fs from "fs";
import path from "path";
import { Window } from "happy-dom";

const templatePath = path.resolve(
	process.cwd(),
	"src/templates/shared",
	"login.html"
);
const template = fs.readFileSync(templatePath, "utf8");

export const renderLogin = async () => {
	try {
		const window = new Window({
			innerWidth: 1024,
			innerHeight: 768,
			url: "http://localhost:3000",
		});
		const document = window.document;
		document.write(template);
		await window.happyDOM.waitUntilComplete();

		return document.documentElement.outerHTML;
	} catch (error) {}
};

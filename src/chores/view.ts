import fs from "fs";
import path from "path";
import { Window } from "happy-dom";
import { type Chore } from "../db/chore.ts";

const templatePath = path.resolve(
	process.cwd(),
	"src/templates/shared",
	"main.html"
);
const template = fs.readFileSync(templatePath, "utf8");

export const renderChores = async (chores: Array<Chore>) => {
	const window = new Window({
		innerWidth: 1024,
		innerHeight: 768,
		url: "http://localhost:3000",
	});
	const document = window.document;
	document.write(template);
	await window.happyDOM.waitUntilComplete();

	const main = document.querySelector("main");

	const choreList = document.createElement("ul");
	main?.append(choreList);

	if (choreList && chores && chores.length > 0) {
		chores.forEach((chore) => {
			const choreElement = document.createElement("div");
			choreElement.className = "chore-item";

			const titleElement = document.createElement("h3");
			titleElement.textContent = chore.title;
			choreElement.appendChild(titleElement);

			const descriptionElement = document.createElement("p");
			descriptionElement.textContent = chore.description;
			choreElement.appendChild(descriptionElement);

			choreList.appendChild(choreElement);
		});
	}

	console.log(document.documentElement.outerHTML);
	return document.documentElement.outerHTML;
};

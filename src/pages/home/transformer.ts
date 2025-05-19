import { type Chore } from "../../services/db/chore.ts";
import { Document } from "happy-dom";

export const renderChores = (template: Document, chores: Array<Chore>) => {
	const main = template?.querySelector("main");

	if (!main) {
		throw new Error("mounting point doesnt exist");
	}

	const choreList = template.createElement("ul");

	main.append(choreList);

	chores.forEach((chore) => {
		const choreElement = template.createElement("div");
		choreElement.className = "chore-item";

		const titleElement = template.createElement("h3");
		titleElement.textContent = chore.title;
		choreElement.append(titleElement);

		const descriptionElement = template.createElement("p");
		descriptionElement.textContent = chore.description;
		choreElement.append(descriptionElement);

		choreList.append(choreElement);
	});

	console.log(template.documentElement.outerHTML);
	return template;
};

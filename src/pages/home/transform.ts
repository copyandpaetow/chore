import { Document } from "happy-dom";
import { type Chore } from "../../server/db/chore.ts";

export const transformHome = (
	document: Document,
	chores: Chore[]
): Document => {
	const placeholder = document.getElementById("placeholder");

	const list = document.createElement("ul");

	chores.forEach((chore) => {
		const entry = document.createElement("li");
		const header = document.createElement("h3");
		const content = document.createElement("p");
		const created = document.createElement("p");
		const due = document.createElement("p");

		header.innerText = chore.title;
		content.innerText = chore.description;
		created.innerText = new Date(chore.created_at).toISOString();
		due.innerText = new Date(chore.next_due_date).toISOString();

		Object.entries(chore).forEach(([name, value]) => {
			entry.dataset[name] = `${value ?? ""}`;
		});

		entry.append(header, content, created, due);
		list.append(entry);
	});

	placeholder?.replaceWith(list);

	return document;
};

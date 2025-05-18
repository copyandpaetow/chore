import { renderHTML } from "../../shared/renderer.ts";

export const renderLogin = async () => {
	const template = await renderHTML("home");
	const main = template?.querySelector("main");

	if (!main || !template) {
		throw new Error("mounting point doesnt exist");
	}

	return template.documentElement.outerHTML;
};

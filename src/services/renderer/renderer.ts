import fs from "fs";
import { Window, Document } from "happy-dom";

const identity = (self: Document): Document => self;

export const renderPage = async (path: string, transformer = identity) => {
	try {
		const template = fs.readFileSync(`${process.cwd()}/${path}`, "utf8");
		const window = new Window();
		const document = window.document;
		document.write(template);

		await window.happyDOM.waitUntilComplete();
		const transformedDom = transformer(document);

		return transformedDom.documentElement.outerHTML;
	} catch (error) {
		throw new Error("could write document");
	}
};

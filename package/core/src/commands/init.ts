import { existsSync, mkdirSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import * as p from "@clack/prompts";
import { add } from "./add.js";
import { ensureConfig } from "./utils.js";

export async function init(args: string[]) {
	if (args[0] === "theme") {
		await themeInit(args.slice(1));
		return;
	}

	p.intro("@litlab/audx init");
	await ensureConfig();
	await add([]);
}

export async function themeInit(_args: string[]) {
	p.intro("@litlab/audx theme init");

	const name = await p.text({
		message: "Patch name",
		placeholder: "my-patch",
		validate: (v: string) => (v.length === 0 ? "Name is required" : undefined),
	});

	if (p.isCancel(name)) {
		p.cancel("Cancelled.");
		process.exit(0);
	}

	const author = await p.text({
		message: "Author",
		placeholder: "Your name",
	});

	if (p.isCancel(author)) {
		p.cancel("Cancelled.");
		process.exit(0);
	}

	const description = await p.text({
		message: "Description",
		placeholder: "What does this patch sound like?",
	});

	if (p.isCancel(description)) {
		p.cancel("Cancelled.");
		process.exit(0);
	}

	const slug = (name as string)
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");

	const filename = `${slug}.json`;
	const dir = resolve(process.cwd(), ".audx", "themes");
	if (!existsSync(dir)) {
		mkdirSync(dir, { recursive: true });
	}
	const target = resolve(dir, filename);

	if (existsSync(target)) {
		const overwrite = await p.confirm({
			message: `${filename} already exists. Overwrite?`,
		});
		if (p.isCancel(overwrite) || !overwrite) {
			p.cancel("Cancelled.");
			process.exit(0);
		}
	}

	const patch = {
		$schema: "../../node_modules/@litlab/audx/schemas/patch.schema.json",
		name: name as string,
		author: (author as string) || undefined,
		version: "1.0.0",
		description: (description as string) || undefined,
		tags: [],
		sounds: {},
	};

	await writeFile(target, `${JSON.stringify(patch, null, 2)}\n`, "utf-8");

	p.log.success(`Created .audx/themes/${filename}`);
	p.outro("Add sounds to the `sounds` object to get started.");
}

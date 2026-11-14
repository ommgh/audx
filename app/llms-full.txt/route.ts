import { readFile } from "node:fs/promises";
import path from "node:path";
import { buildLlmsFullTxt } from "@/lib/llms";

// Rendered once at build time, so the README is read from the repo then.
export const dynamic = "force-static";

export async function GET() {
	const readme = await readFile(
		path.join(process.cwd(), "package/core/README.md"),
		"utf8",
	);
	return new Response(buildLlmsFullTxt(readme), {
		headers: { "Content-Type": "text/markdown; charset=utf-8" },
	});
}

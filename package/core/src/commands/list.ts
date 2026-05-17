import * as p from "@clack/prompts";
import { getInstalledThemes, getThemesDir } from "./utils.js";

export async function list(_args: string[]) {
	p.intro("@litlab/audx list");

	const themes = await getInstalledThemes();

	if (themes.length === 0) {
		p.log.warn(`No themes found in ${getThemesDir()}`);
		p.outro("Run `@litlab/audx add` to install themes.");
		return;
	}

	const rows = themes.map(
		(theme) =>
			`  ${theme.name.padEnd(16)} ${String(theme.soundCount).padStart(3)} sounds   ${theme.description ?? ""}`,
	);

	p.note(rows.join("\n"), `${themes.length} theme(es) installed`);
	p.outro(getThemesDir());
}

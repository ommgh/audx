import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";
import type { SoundPatch } from "../types.js";
import { CliError } from "./args.js";

export const DEFAULT_REGISTRY = "https://audx.site/api";

export type ThemeIndexEntry = {
	name: string;
	description: string;
	author?: string;
	tags?: string[];
	soundCount: number;
	sounds?: string[];
	builtIn?: boolean;
};

/** Built-in themes, used to keep the CLI helpful when offline. */
export const BUILT_IN_THEMES: ThemeIndexEntry[] = [
	{
		name: "minimal",
		description: "Quiet and precise. Pure sine tones and soft air.",
		soundCount: 43,
		builtIn: true,
	},
	{
		name: "playful",
		description: "Bouncy and bright. Springy bloops and pentatonic chimes.",
		soundCount: 43,
		builtIn: true,
	},
	{
		name: "mechanical",
		description: "Tactile and physical. Key switches, latches and relays.",
		soundCount: 43,
		builtIn: true,
	},
	{
		name: "retro",
		description: "An 8-bit console. Square waves and bit-crushed noise.",
		soundCount: 43,
		builtIn: true,
	},
];

export function registryUrl(override?: string): string {
	return (process.env.AUDX_REGISTRY ?? override ?? DEFAULT_REGISTRY).replace(
		/\/+$/,
		"",
	);
}

export type ThemeSourceKind = "registry" | "url" | "file";

export function sourceKind(source: string): ThemeSourceKind {
	if (/^https?:\/\//.test(source)) return "url";
	if (
		source.endsWith(".json") ||
		source.startsWith(".") ||
		source.startsWith("/") ||
		isAbsolute(source)
	) {
		return "file";
	}
	return "registry";
}

async function getJson(url: string): Promise<unknown> {
	let res: Response;
	try {
		res = await fetch(url, {
			headers: { Accept: "application/json" },
			signal: AbortSignal.timeout(15_000),
		});
	} catch (err) {
		const cause = (err as { cause?: { code?: string } }).cause?.code;
		throw new CliError(
			`Couldn't reach ${new URL(url).host}${cause ? ` (${cause})` : ""}.`,
			"Check your connection, or point AUDX_REGISTRY at another registry.",
		);
	}
	if (res.status === 404) throw new NotFoundError(url);
	if (!res.ok) {
		throw new CliError(`${new URL(url).host} responded with ${res.status}.`);
	}
	try {
		return await res.json();
	} catch {
		throw new CliError(`${url} did not return JSON.`);
	}
}

class NotFoundError extends CliError {
	constructor(url: string) {
		super(`Not found: ${url}`);
	}
}

export async function fetchThemeIndex(
	registry: string,
): Promise<ThemeIndexEntry[]> {
	const data = await getJson(`${registry}/audio/themes`);
	if (!Array.isArray(data)) throw new CliError("Unexpected registry response.");
	return data as ThemeIndexEntry[];
}

/** Like fetchThemeIndex, but falls back to the built-in list when offline. */
export async function themeIndexOrBuiltIns(
	registry: string,
): Promise<{ themes: ThemeIndexEntry[]; offline: boolean }> {
	try {
		return { themes: await fetchThemeIndex(registry), offline: false };
	} catch {
		return { themes: BUILT_IN_THEMES, offline: true };
	}
}

export function isThemePatch(value: unknown): value is SoundPatch {
	if (!value || typeof value !== "object") return false;
	const v = value as Record<string, unknown>;
	return (
		typeof v.name === "string" &&
		!!v.sounds &&
		typeof v.sounds === "object" &&
		!Array.isArray(v.sounds)
	);
}

const cache = new Map<string, SoundPatch>();

/**
 * Loads a theme from the registry (`minimal`), a URL, or a local `.json`
 * file. Results are cached for the lifetime of the process.
 */
export async function loadTheme(
	source: string,
	opts: { cwd: string; registry: string },
): Promise<SoundPatch> {
	const key = `${opts.registry}|${source}`;
	const hit = cache.get(key);
	if (hit) return hit;

	let data: unknown;
	const kind = sourceKind(source);

	if (kind === "file") {
		const path = resolve(opts.cwd, source);
		if (!existsSync(path)) throw new CliError(`No theme file at ${source}.`);
		try {
			data = JSON.parse(readFileSync(path, "utf-8"));
		} catch (err) {
			throw new CliError(`Couldn't parse ${source}: ${(err as Error).message}`);
		}
	} else if (kind === "url") {
		data = await getJson(source);
	} else {
		try {
			data = await getJson(
				`${opts.registry}/audio/theme/${encodeURIComponent(source)}`,
			);
		} catch (err) {
			if (err instanceof NotFoundError) {
				const { themes } = await themeIndexOrBuiltIns(opts.registry);
				const names = themes.map((t) => t.name);
				const guess = closest(source, names);
				throw new CliError(
					`Theme "${source}" doesn't exist.`,
					guess
						? `Did you mean "${guess}"? Run \`audx list --themes\` to see all themes.`
						: "Run `audx list --themes` to see all themes.",
				);
			}
			throw err;
		}
	}

	if (!isThemePatch(data)) {
		throw new CliError(
			`${source} is not a valid audx theme (needs "name" and "sounds").`,
		);
	}
	cache.set(key, data);
	return data;
}

function levenshtein(a: string, b: string): number {
	const dp = Array.from({ length: b.length + 1 }, (_, i) => i);
	for (let i = 1; i <= a.length; i++) {
		let prev = dp[0];
		dp[0] = i;
		for (let j = 1; j <= b.length; j++) {
			const tmp = dp[j];
			dp[j] = Math.min(
				dp[j] + 1,
				dp[j - 1] + 1,
				prev + (a[i - 1] === b[j - 1] ? 0 : 1),
			);
			prev = tmp;
		}
	}
	return dp[b.length];
}

/** The closest candidate to `input`, if it's a plausible typo. */
export function closest(
	input: string,
	candidates: string[],
): string | undefined {
	let best: string | undefined;
	let bestScore = Number.POSITIVE_INFINITY;
	const lower = input.toLowerCase();
	for (const c of candidates) {
		if (c.startsWith(lower) && lower.length >= 2) return c;
		const score = levenshtein(lower, c.toLowerCase());
		if (score < bestScore) {
			bestScore = score;
			best = c;
		}
	}
	return bestScore <= Math.max(2, Math.floor(input.length / 3))
		? best
		: undefined;
}

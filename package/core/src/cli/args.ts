export type ParsedArgs = {
	/** Positional arguments (command excluded). */
	_: string[];
	flags: Record<string, string | boolean>;
};

const ALIASES: Record<string, string> = {
	y: "yes",
	t: "theme",
	a: "all",
	o: "overwrite",
	h: "help",
	v: "version",
	f: "force",
};

/** Flags that take a value. */
const VALUE_FLAGS = new Set(["theme", "cwd", "tune", "data", "dir", "from"]);

export function parseArgs(argv: string[]): ParsedArgs {
	const out: ParsedArgs = { _: [], flags: {} };

	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i];

		if (arg === "--") {
			out._.push(...argv.slice(i + 1));
			break;
		}

		if (arg.startsWith("--")) {
			const body = arg.slice(2);
			const eq = body.indexOf("=");
			const rawKey = eq === -1 ? body : body.slice(0, eq);
			const inline = eq === -1 ? undefined : body.slice(eq + 1);
			const key = ALIASES[rawKey] ?? rawKey;
			if (VALUE_FLAGS.has(key)) {
				const value = inline ?? argv[++i];
				if (value === undefined || value.startsWith("-")) {
					throw new CliError(`--${key} needs a value.`);
				}
				out.flags[key] = value;
			} else {
				out.flags[key] = inline === undefined ? true : inline !== "false";
			}
			continue;
		}

		if (arg.startsWith("-") && arg.length > 1) {
			// -yo == -y -o ; -t value
			const letters = arg.slice(1).split("");
			for (let j = 0; j < letters.length; j++) {
				const key = ALIASES[letters[j]] ?? letters[j];
				if (VALUE_FLAGS.has(key)) {
					const rest = letters.slice(j + 1).join("");
					const value = rest || argv[++i];
					if (value === undefined || value.startsWith("-")) {
						throw new CliError(`-${letters[j]} needs a value.`);
					}
					out.flags[key] = value;
					break;
				}
				out.flags[key] = true;
			}
			continue;
		}

		out._.push(arg);
	}

	return out;
}

export function flag(args: ParsedArgs, name: string): boolean {
	return args.flags[name] === true;
}

export function value(args: ParsedArgs, name: string): string | undefined {
	const v = args.flags[name];
	return typeof v === "string" ? v : undefined;
}

/** An expected, user-facing failure: printed without a stack trace. */
export class CliError extends Error {
	constructor(
		message: string,
		readonly hint?: string,
	) {
		super(message);
	}
}

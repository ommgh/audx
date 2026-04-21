import { SOUND_PROMPT_TEMPLATES } from "@/lib/sound-prompt-templates";

const MAX_PROMPT_LENGTH = 500;

export interface BuildPromptInput {
	themePrompt: string;
	semanticName: string;
	uxContext: string;
	category: string;
}

export interface BuildPromptResult {
	text: string;
	duration: number;
}

/**
 * Combines the template UX context with the user's mood descriptors.
 * Truncates mood portion if combined prompt exceeds 500 chars.
 */
export function buildSoundPrompt(input: BuildPromptInput): BuildPromptResult {
	const { themePrompt, semanticName, uxContext, category } = input;

	const template =
		SOUND_PROMPT_TEMPLATES[semanticName as keyof typeof SOUND_PROMPT_TEMPLATES];
	const duration = template?.defaultDuration ?? 0.5;

	// Build the fixed prefix: UX context + category
	const prefix = `${uxContext} — ${category} sound.`;

	// Build the mood suffix from the user's theme prompt
	const moodSuffix = ` Style: ${themePrompt}.`;

	const combined = prefix + moodSuffix;

	if (combined.length <= MAX_PROMPT_LENGTH) {
		return { text: combined, duration };
	}

	// Truncate the mood portion to fit within the limit
	const availableForMood =
		MAX_PROMPT_LENGTH - prefix.length - " Style: ".length - "...".length;

	if (availableForMood <= 0) {
		// Prefix alone is too long or barely fits — return just the prefix truncated
		return { text: prefix.slice(0, MAX_PROMPT_LENGTH), duration };
	}

	const truncatedMood = themePrompt.slice(0, availableForMood);
	return { text: `${prefix} Style: ${truncatedMood}...`, duration };
}

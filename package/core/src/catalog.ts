/**
 * The canonical list of semantic UI sounds every built-in audx theme ships.
 *
 * Themes are free to add more, but the names below are guaranteed to exist
 * in every first-party theme, which is what makes `audx theme <name>` able
 * to swap an app's entire sound personality without touching code.
 */

export type SoundCategory =
	| "input"
	| "selection"
	| "navigation"
	| "editing"
	| "feedback"
	| "notification"
	| "status";

export type SoundCatalogEntry = {
	name: string;
	category: SoundCategory;
	/** When to reach for this sound. */
	description: string;
};

export const SOUND_CATEGORIES: { name: SoundCategory; label: string }[] = [
	{ name: "input", label: "Input" },
	{ name: "selection", label: "Selection" },
	{ name: "navigation", label: "Navigation" },
	{ name: "editing", label: "Editing" },
	{ name: "feedback", label: "Feedback" },
	{ name: "notification", label: "Notification" },
	{ name: "status", label: "Status" },
];

export const SOUND_CATALOG: SoundCatalogEntry[] = [
	// input
	{
		name: "click",
		category: "input",
		description: "Primary buttons and links",
	},
	{
		name: "tap",
		category: "input",
		description: "Light taps: icon buttons, chips, small targets",
	},
	{
		name: "press",
		category: "input",
		description: "Pointer down on a pressable surface",
	},
	{
		name: "release",
		category: "input",
		description: "Pointer up, pairs with press",
	},
	{
		name: "hover",
		category: "input",
		description: "Pointer enters an interactive element (use sparingly)",
	},
	{
		name: "focus",
		category: "input",
		description: "An input or field gains focus",
	},
	{
		name: "blur",
		category: "input",
		description: "An input or field loses focus",
	},
	{
		name: "type",
		category: "input",
		description: "Keystrokes. Pair with jitter so repeats feel natural",
	},
	{
		name: "tick",
		category: "input",
		description: "Slider steps, steppers, wheel pickers",
	},
	// selection
	{
		name: "toggle",
		category: "selection",
		description: "Neutral switch flip when on/off is not meaningful",
	},
	{
		name: "enable",
		category: "selection",
		description: "Switch turned on, feature enabled",
	},
	{
		name: "disable",
		category: "selection",
		description: "Switch turned off, feature disabled",
	},
	{
		name: "select",
		category: "selection",
		description: "Checkbox checked, item selected, option picked",
	},
	{
		name: "deselect",
		category: "selection",
		description: "Checkbox unchecked, selection removed",
	},
	{
		name: "tab",
		category: "selection",
		description: "Tabs and segmented controls",
	},
	// navigation
	{
		name: "open",
		category: "navigation",
		description: "Dialog, sheet or popover opens",
	},
	{
		name: "close",
		category: "navigation",
		description: "Dialog, sheet or popover closes",
	},
	{
		name: "expand",
		category: "navigation",
		description: "Accordion, dropdown or tree node expands",
	},
	{
		name: "collapse",
		category: "navigation",
		description: "Accordion, dropdown or tree node collapses",
	},
	{
		name: "back",
		category: "navigation",
		description: "Navigate back, previous step",
	},
	{
		name: "forward",
		category: "navigation",
		description: "Navigate forward, next step",
	},
	{
		name: "scroll",
		category: "navigation",
		description: "Scroll snap, carousel item settles",
	},
	{
		name: "slide",
		category: "navigation",
		description: "Drawers, swipes and sliding panels",
	},
	// editing
	{ name: "copy", category: "editing", description: "Copied to clipboard" },
	{ name: "paste", category: "editing", description: "Pasted from clipboard" },
	{
		name: "undo",
		category: "editing",
		description: "Undo or revert an action",
	},
	{
		name: "clear",
		category: "editing",
		description: "Clear an input, reset filters, dismiss all",
	},
	{
		name: "delete",
		category: "editing",
		description: "Item deleted or moved to trash",
	},
	{
		name: "drag",
		category: "editing",
		description: "Item picked up for dragging",
	},
	{
		name: "drop",
		category: "editing",
		description: "Dragged item dropped into place",
	},
	// feedback
	{
		name: "success",
		category: "feedback",
		description: "Action succeeded: saved, submitted, done",
	},
	{
		name: "complete",
		category: "feedback",
		description: "Bigger milestone: upload finished, onboarding complete",
	},
	{ name: "error", category: "feedback", description: "Something failed" },
	{
		name: "warning",
		category: "feedback",
		description: "Needs attention but nothing broke",
	},
	{
		name: "deny",
		category: "feedback",
		description: "Action not allowed: invalid input, disabled button",
	},
	{
		name: "info",
		category: "feedback",
		description: "Neutral informational toast",
	},
	// notification
	{
		name: "notify",
		category: "notification",
		description: "Incoming notification or alert",
	},
	{
		name: "send",
		category: "notification",
		description: "Message or form sent",
	},
	{
		name: "receive",
		category: "notification",
		description: "Message received in a conversation",
	},
	{
		name: "pop",
		category: "notification",
		description: "Reactions, likes, badges and small celebrations",
	},
	// status
	{
		name: "loading",
		category: "status",
		description: "Work started, a process is running",
	},
	{
		name: "lock",
		category: "status",
		description: "Locked, secured, permission revoked",
	},
	{
		name: "unlock",
		category: "status",
		description: "Unlocked, access granted",
	},
];

const BY_NAME = new Map(SOUND_CATALOG.map((entry) => [entry.name, entry]));

/** Looks up catalog metadata for a sound name. */
export function getSoundInfo(name: string): SoundCatalogEntry | undefined {
	return BY_NAME.get(name);
}

/** A sensible starter set for a typical app. */
export const STARTER_SOUNDS = [
	"click",
	"toggle",
	"select",
	"open",
	"close",
	"copy",
	"success",
	"error",
	"notify",
];

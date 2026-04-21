import type { CategoryName, SemanticSoundName } from "@/package/src/types";

export interface SoundPromptTemplate {
	semanticName: SemanticSoundName;
	category: CategoryName;
	uxContext: string;
	durationRange: [number, number];
	defaultDuration: number;
}

export const SOUND_PROMPT_TEMPLATES: Record<
	SemanticSoundName,
	SoundPromptTemplate
> = {
	// ── Existing (16) ───────────────────────────────────────────────────────
	success: {
		semanticName: "success",
		category: "feedback",
		uxContext: "positive confirmation chime indicating a successful action",
		durationRange: [0.3, 1.0],
		defaultDuration: 0.5,
	},
	error: {
		semanticName: "error",
		category: "feedback",
		uxContext: "negative error tone indicating something went wrong",
		durationRange: [0.3, 1.0],
		defaultDuration: 0.5,
	},
	warning: {
		semanticName: "warning",
		category: "feedback",
		uxContext: "cautionary alert tone for a warning state",
		durationRange: [0.3, 1.0],
		defaultDuration: 0.5,
	},
	info: {
		semanticName: "info",
		category: "notification",
		uxContext: "neutral informational notification tone",
		durationRange: [0.3, 1.0],
		defaultDuration: 0.5,
	},
	click: {
		semanticName: "click",
		category: "interaction",
		uxContext: "short UI button click",
		durationRange: [0.1, 0.3],
		defaultDuration: 0.15,
	},
	back: {
		semanticName: "back",
		category: "navigation",
		uxContext: "backward navigation swoosh indicating going back",
		durationRange: [0.2, 0.5],
		defaultDuration: 0.3,
	},
	enter: {
		semanticName: "enter",
		category: "interaction",
		uxContext: "confirmation key press or enter action",
		durationRange: [0.1, 0.3],
		defaultDuration: 0.15,
	},
	delete: {
		semanticName: "delete",
		category: "destructive",
		uxContext: "destructive delete action removing an item",
		durationRange: [0.2, 0.5],
		defaultDuration: 0.3,
	},
	copy: {
		semanticName: "copy",
		category: "clipboard",
		uxContext: "clipboard copy action confirming content was copied",
		durationRange: [0.1, 0.3],
		defaultDuration: 0.2,
	},
	paste: {
		semanticName: "paste",
		category: "clipboard",
		uxContext: "clipboard paste action confirming content was pasted",
		durationRange: [0.1, 0.3],
		defaultDuration: 0.2,
	},
	scroll: {
		semanticName: "scroll",
		category: "navigation",
		uxContext: "subtle scroll tick for list or page scrolling",
		durationRange: [0.1, 0.2],
		defaultDuration: 0.1,
	},
	hover: {
		semanticName: "hover",
		category: "interaction",
		uxContext: "gentle hover feedback when cursor enters an element",
		durationRange: [0.1, 0.2],
		defaultDuration: 0.1,
	},
	toggle: {
		semanticName: "toggle",
		category: "interaction",
		uxContext: "switch or toggle flipping between on and off states",
		durationRange: [0.1, 0.3],
		defaultDuration: 0.15,
	},
	notify: {
		semanticName: "notify",
		category: "notification",
		uxContext: "incoming notification ping",
		durationRange: [0.3, 1.0],
		defaultDuration: 0.5,
	},
	complete: {
		semanticName: "complete",
		category: "feedback",
		uxContext: "task completion chime indicating a process finished",
		durationRange: [0.3, 1.0],
		defaultDuration: 0.5,
	},
	loading: {
		semanticName: "loading",
		category: "progress",
		uxContext: "loading or processing loop indicator",
		durationRange: [0.5, 1.5],
		defaultDuration: 1.0,
	},

	// ── Interaction (9) ─────────────────────────────────────────────────────
	tap: {
		semanticName: "tap",
		category: "interaction",
		uxContext: "light tap on a touch surface",
		durationRange: [0.1, 0.2],
		defaultDuration: 0.1,
	},
	press: {
		semanticName: "press",
		category: "interaction",
		uxContext: "firm button press with tactile feedback",
		durationRange: [0.1, 0.3],
		defaultDuration: 0.15,
	},
	release: {
		semanticName: "release",
		category: "interaction",
		uxContext: "button release after being pressed",
		durationRange: [0.1, 0.2],
		defaultDuration: 0.1,
	},
	drag: {
		semanticName: "drag",
		category: "interaction",
		uxContext: "dragging an element across the interface",
		durationRange: [0.2, 0.5],
		defaultDuration: 0.3,
	},
	drop: {
		semanticName: "drop",
		category: "interaction",
		uxContext: "dropping a dragged element into place",
		durationRange: [0.1, 0.3],
		defaultDuration: 0.2,
	},
	select: {
		semanticName: "select",
		category: "interaction",
		uxContext: "selecting an item from a list or group",
		durationRange: [0.1, 0.3],
		defaultDuration: 0.15,
	},
	deselect: {
		semanticName: "deselect",
		category: "interaction",
		uxContext: "deselecting a previously selected item",
		durationRange: [0.1, 0.3],
		defaultDuration: 0.15,
	},
	focus: {
		semanticName: "focus",
		category: "interaction",
		uxContext: "element receiving keyboard or pointer focus",
		durationRange: [0.1, 0.2],
		defaultDuration: 0.1,
	},
	blur: {
		semanticName: "blur",
		category: "interaction",
		uxContext: "element losing focus",
		durationRange: [0.1, 0.2],
		defaultDuration: 0.1,
	},

	// ── Navigation (7) ──────────────────────────────────────────────────────
	forward: {
		semanticName: "forward",
		category: "navigation",
		uxContext: "forward navigation swoosh indicating moving ahead",
		durationRange: [0.2, 0.5],
		defaultDuration: 0.3,
	},
	open: {
		semanticName: "open",
		category: "navigation",
		uxContext: "opening a panel, modal, or menu",
		durationRange: [0.2, 0.5],
		defaultDuration: 0.3,
	},
	close: {
		semanticName: "close",
		category: "navigation",
		uxContext: "closing a panel, modal, or menu",
		durationRange: [0.2, 0.5],
		defaultDuration: 0.3,
	},
	expand: {
		semanticName: "expand",
		category: "navigation",
		uxContext: "expanding a collapsible section or accordion",
		durationRange: [0.2, 0.5],
		defaultDuration: 0.3,
	},
	collapse: {
		semanticName: "collapse",
		category: "navigation",
		uxContext: "collapsing an expanded section or accordion",
		durationRange: [0.2, 0.5],
		defaultDuration: 0.3,
	},
	tab: {
		semanticName: "tab",
		category: "navigation",
		uxContext: "switching between tabs in a tab bar",
		durationRange: [0.1, 0.3],
		defaultDuration: 0.2,
	},
	swipe: {
		semanticName: "swipe",
		category: "navigation",
		uxContext: "swiping gesture for carousel or page navigation",
		durationRange: [0.2, 0.5],
		defaultDuration: 0.3,
	},

	// ── Feedback (5) ────────────────────────────────────────────────────────
	confirm: {
		semanticName: "confirm",
		category: "feedback",
		uxContext: "user confirmation of an action or dialog",
		durationRange: [0.2, 0.5],
		defaultDuration: 0.3,
	},
	cancel: {
		semanticName: "cancel",
		category: "feedback",
		uxContext: "cancellation of an action or dismissal of a dialog",
		durationRange: [0.2, 0.5],
		defaultDuration: 0.3,
	},
	deny: {
		semanticName: "deny",
		category: "feedback",
		uxContext: "denial or rejection of a request",
		durationRange: [0.2, 0.5],
		defaultDuration: 0.3,
	},
	undo: {
		semanticName: "undo",
		category: "feedback",
		uxContext: "undoing a previous action",
		durationRange: [0.2, 0.5],
		defaultDuration: 0.3,
	},
	redo: {
		semanticName: "redo",
		category: "feedback",
		uxContext: "redoing a previously undone action",
		durationRange: [0.2, 0.5],
		defaultDuration: 0.3,
	},

	// ── Notification (4) ────────────────────────────────────────────────────
	alert: {
		semanticName: "alert",
		category: "notification",
		uxContext: "urgent alert requiring immediate attention",
		durationRange: [0.5, 1.5],
		defaultDuration: 0.8,
	},
	message: {
		semanticName: "message",
		category: "notification",
		uxContext: "incoming message or chat notification",
		durationRange: [0.3, 1.0],
		defaultDuration: 0.5,
	},
	reminder: {
		semanticName: "reminder",
		category: "notification",
		uxContext: "scheduled reminder notification",
		durationRange: [0.5, 1.5],
		defaultDuration: 0.8,
	},
	mention: {
		semanticName: "mention",
		category: "notification",
		uxContext: "user mention or tag notification",
		durationRange: [0.3, 1.0],
		defaultDuration: 0.5,
	},

	// ── Transition (5) ──────────────────────────────────────────────────────
	show: {
		semanticName: "show",
		category: "transition",
		uxContext: "element appearing or becoming visible",
		durationRange: [0.3, 1.0],
		defaultDuration: 0.5,
	},
	hide: {
		semanticName: "hide",
		category: "transition",
		uxContext: "element disappearing or becoming hidden",
		durationRange: [0.3, 1.0],
		defaultDuration: 0.5,
	},
	slide: {
		semanticName: "slide",
		category: "transition",
		uxContext: "sliding transition between views or panels",
		durationRange: [0.3, 0.8],
		defaultDuration: 0.5,
	},
	fade: {
		semanticName: "fade",
		category: "transition",
		uxContext: "fading transition for opacity changes",
		durationRange: [0.3, 0.8],
		defaultDuration: 0.5,
	},
	pop: {
		semanticName: "pop",
		category: "transition",
		uxContext: "popping element into view with a bouncy entrance",
		durationRange: [0.2, 0.5],
		defaultDuration: 0.3,
	},

	// ── Destructive (4) ─────────────────────────────────────────────────────
	clear: {
		semanticName: "clear",
		category: "destructive",
		uxContext: "clearing all items or resetting a form",
		durationRange: [0.2, 0.5],
		defaultDuration: 0.3,
	},
	remove: {
		semanticName: "remove",
		category: "destructive",
		uxContext: "removing an item from a list or collection",
		durationRange: [0.2, 0.5],
		defaultDuration: 0.3,
	},
	trash: {
		semanticName: "trash",
		category: "destructive",
		uxContext: "moving an item to the trash or recycle bin",
		durationRange: [0.3, 0.8],
		defaultDuration: 0.4,
	},
	shred: {
		semanticName: "shred",
		category: "destructive",
		uxContext: "permanently destroying or shredding data",
		durationRange: [0.3, 0.8],
		defaultDuration: 0.5,
	},

	// ── Progress (5) ────────────────────────────────────────────────────────
	upload: {
		semanticName: "upload",
		category: "progress",
		uxContext: "file upload starting or completing",
		durationRange: [0.3, 1.0],
		defaultDuration: 0.5,
	},
	download: {
		semanticName: "download",
		category: "progress",
		uxContext: "file download starting or completing",
		durationRange: [0.3, 1.0],
		defaultDuration: 0.5,
	},
	refresh: {
		semanticName: "refresh",
		category: "progress",
		uxContext: "refreshing or reloading content",
		durationRange: [0.3, 0.8],
		defaultDuration: 0.5,
	},
	sync: {
		semanticName: "sync",
		category: "progress",
		uxContext: "data synchronization in progress or complete",
		durationRange: [0.3, 1.0],
		defaultDuration: 0.5,
	},
	process: {
		semanticName: "process",
		category: "progress",
		uxContext: "background process running or completing",
		durationRange: [0.3, 1.0],
		defaultDuration: 0.5,
	},

	// ── Clipboard (2) ───────────────────────────────────────────────────────
	cut: {
		semanticName: "cut",
		category: "clipboard",
		uxContext: "cutting content to the clipboard",
		durationRange: [0.1, 0.3],
		defaultDuration: 0.2,
	},
	snapshot: {
		semanticName: "snapshot",
		category: "clipboard",
		uxContext: "taking a screenshot or snapshot capture",
		durationRange: [0.2, 0.5],
		defaultDuration: 0.3,
	},

	// ── State (6) ───────────────────────────────────────────────────────────
	lock: {
		semanticName: "lock",
		category: "state",
		uxContext: "locking an item or entering a secured state",
		durationRange: [0.2, 0.5],
		defaultDuration: 0.3,
	},
	unlock: {
		semanticName: "unlock",
		category: "state",
		uxContext: "unlocking an item or exiting a secured state",
		durationRange: [0.2, 0.5],
		defaultDuration: 0.3,
	},
	enable: {
		semanticName: "enable",
		category: "state",
		uxContext: "enabling a feature or turning something on",
		durationRange: [0.1, 0.3],
		defaultDuration: 0.2,
	},
	disable: {
		semanticName: "disable",
		category: "state",
		uxContext: "disabling a feature or turning something off",
		durationRange: [0.1, 0.3],
		defaultDuration: 0.2,
	},
	connect: {
		semanticName: "connect",
		category: "state",
		uxContext: "establishing a connection or going online",
		durationRange: [0.3, 0.8],
		defaultDuration: 0.5,
	},
	disconnect: {
		semanticName: "disconnect",
		category: "state",
		uxContext: "losing a connection or going offline",
		durationRange: [0.3, 0.8],
		defaultDuration: 0.5,
	},

	// ── Media (4) ───────────────────────────────────────────────────────────
	mute: {
		semanticName: "mute",
		category: "media",
		uxContext: "muting audio or microphone",
		durationRange: [0.1, 0.3],
		defaultDuration: 0.2,
	},
	unmute: {
		semanticName: "unmute",
		category: "media",
		uxContext: "unmuting audio or microphone",
		durationRange: [0.1, 0.3],
		defaultDuration: 0.2,
	},
	record: {
		semanticName: "record",
		category: "media",
		uxContext: "starting a recording session",
		durationRange: [0.2, 0.5],
		defaultDuration: 0.3,
	},
	capture: {
		semanticName: "capture",
		category: "media",
		uxContext: "capturing a photo or media frame",
		durationRange: [0.2, 0.5],
		defaultDuration: 0.3,
	},
};

/**
 * 10 representative preview sounds — one per category.
 * Used for the cost-saving preview phase before full generation.
 */
export const PREVIEW_SOUNDS: SemanticSoundName[] = [
	"click", // interaction
	"back", // navigation
	"success", // feedback
	"alert", // notification
	"show", // transition
	"trash", // destructive
	"upload", // progress
	"copy", // clipboard
	"lock", // state
	"mute", // media
];

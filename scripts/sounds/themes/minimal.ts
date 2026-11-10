import {
	arp,
	at,
	bp,
	fsweep,
	hp,
	lp,
	n,
	noise,
	sine,
	stack,
	sweep,
	type ThemeDesign,
	tri,
} from "../dsl";

/**
 * Minimal — pure sines and soft air. Quiet, precise, made to disappear into
 * a productivity app. Soft 1–3ms attacks so nothing ever clicks harshly.
 */
export const minimal: ThemeDesign = {
	name: "minimal",
	description:
		"Quiet and precise. Pure sine tones and soft air, built to disappear into productivity apps.",
	tags: ["subtle", "clean", "productivity"],
	loudness: -2,
	sounds: {
		// ── input ──
		click: stack(
			sine(sweep(1700, 1250), [0.001, 0.03], { g: 1 }),
			noise("white", 0.006, { g: 0.25, filter: hp(4500) }),
		),
		tap: sine(2350, [0.001, 0.016]),
		press: stack(
			sine(sweep(560, 430), [0.002, 0.05]),
			noise("pink", 0.012, { g: 0.3, filter: lp(1400) }),
		),
		release: sine(sweep(980, 1180), [0.002, 0.03]),
		hover: stack(
			sine(n("E7"), [0.005, 0.015]),
			sine(n("B7"), [0.005, 0.01], { g: 0.4 }),
		),
		focus: stack(
			sine(sweep(1180, 1480), [0.02, 0.06]),
			sine(sweep(2360, 2960), [0.02, 0.03], { g: 0.15 }),
		),
		blur: sine(sweep(660, 560), [0.01, 0.05]),
		type: stack(
			noise("white", 0.012, { filter: bp(3200, 1.6) }),
			sine(1900, 0.008, { g: 0.35 }),
		),
		tick: sine(3300, [0.0005, 0.005]),

		// ── selection ──
		toggle: stack(
			noise("white", 0.009, { g: 0.5, filter: bp(2200, 2) }),
			sine(sweep(560, 880), [0.001, 0.05]),
		),
		enable: stack(
			sine(n("C6"), [0.002, 0.05], { g: 0.85 }),
			at(0.045, sine(n("G6"), [0.002, 0.08])),
		),
		disable: stack(
			sine(n("G6"), [0.002, 0.05], { g: 0.85 }),
			at(0.045, sine(n("C6"), [0.002, 0.07])),
		),
		select: stack(
			sine(n("A6"), [0.002, 0.06]),
			sine(n("A7"), [0.002, 0.025], { g: 0.18 }),
		),
		deselect: stack(
			sine(n("D6"), [0.002, 0.03]),
			at(0.035, sine(n("A5"), [0.002, 0.04])),
		),
		tab: stack(
			sine(n("G5"), [0.001, 0.03]),
			sine(n("G7"), [0.001, 0.01], { g: 0.3 }),
		),

		// ── navigation ──
		open: stack(
			sine(sweep(620, 1240), [0.012, 0.12]),
			noise("pink", [0.04, 0.08], {
				g: 0.35,
				filter: fsweep("bandpass", 900, 3200, 0.06, 1.2),
			}),
		),
		close: stack(
			sine(sweep(1240, 600), [0.004, 0.1]),
			noise("pink", [0.005, 0.07], {
				g: 0.3,
				filter: fsweep("bandpass", 3000, 800, 0.08, 1.2),
			}),
		),
		expand: noise("pink", [0.05, 0.09], {
			filter: fsweep("bandpass", 700, 3600, 0.07, 1.6),
		}),
		collapse: noise("pink", [0.006, 0.1], {
			filter: fsweep("bandpass", 3600, 700, 0.1, 1.6),
		}),
		back: stack(
			sine(sweep(1050, 720), [0.003, 0.06]),
			noise("white", 0.004, { g: 0.2, filter: hp(4000) }),
		),
		forward: stack(
			sine(sweep(720, 1050), [0.003, 0.06]),
			noise("white", 0.004, { g: 0.2, filter: hp(4000) }),
		),
		scroll: sine(sweep(1800, 1500), [0.0005, 0.01]),
		slide: noise("pink", [0.08, 0.18], {
			filter: fsweep("lowpass", 300, 1600, 0.2, 0.8),
		}),

		// ── editing ──
		copy: stack(
			sine(n("G6"), [0.001, 0.035]),
			at(0.05, sine(n("C7"), [0.001, 0.045])),
		),
		paste: stack(
			sine(sweep(n("G5"), n("E5")), [0.002, 0.07]),
			noise("pink", 0.01, { g: 0.35, filter: lp(2000) }),
		),
		undo: stack(
			// reverse-envelope swell reads as "rewind"
			sine(sweep(990, 1320), [0.07, 0.015]),
			noise("white", [0.06, 0.01], { g: 0.2, filter: hp(3000) }),
		),
		clear: noise("white", [0.004, 0.16], {
			filter: fsweep("highpass", 6000, 1800, 0.16, 0.8),
		}),
		delete: stack(
			sine(sweep(660, 240), [0.002, 0.12]),
			noise("pink", 0.05, { g: 0.4, filter: lp(900) }),
		),
		drag: stack(
			sine(sweep(440, 560), [0.02, 0.06]),
			noise("pink", [0.02, 0.04], { g: 0.25, filter: bp(1200, 1) }),
		),
		drop: stack(
			sine(sweep(340, 190), [0.002, 0.08]),
			noise("brown", 0.04, { g: 0.6, filter: lp(500) }),
		),

		// ── feedback ──
		success: stack(
			sine(n("G5"), [0.004, 0.16]),
			at(0.075, sine(n("D6"), [0.004, 0.24])),
		),
		complete: stack(
			arp([n("C6"), n("E6"), n("G6")], 0.065, (f) => sine(f, [0.004, 0.2])),
			at(0.195, sine(n("C7"), [0.006, 0.38], { g: 0.7 })),
			at(0.195, sine(n("G7"), [0.006, 0.2], { g: 0.12 })),
		),
		error: stack(
			tri(n("E4"), [0.003, 0.12], { filter: lp(1400) }),
			tri(n("F4"), [0.003, 0.12], { g: 0.8, filter: lp(1400) }),
			at(0.11, tri(n("C4"), [0.003, 0.2], { filter: lp(1200) })),
		),
		warning: stack(
			sine(n("A5"), [0.003, 0.08]),
			at(0.13, sine(n("A5"), [0.003, 0.1])),
		),
		deny: stack(
			tri(n("A3"), [0.002, 0.05], { filter: lp(800) }),
			at(0.075, tri(n("A3"), [0.002, 0.06], { filter: lp(800) })),
		),
		info: stack(
			sine(n("E6"), [0.003, 0.22]),
			sine(n("E7"), [0.003, 0.06], { g: 0.15 }),
		),

		// ── notification ──
		notify: stack(
			sine(n("C6"), [0.002, 0.32], { fm: { ratio: 2, depth: 90 } }),
			at(0.13, sine(n("G6"), [0.002, 0.42], { fm: { ratio: 2, depth: 90 } })),
		),
		send: stack(
			sine(sweep(500, 1700), [0.004, 0.09]),
			noise("white", [0.03, 0.05], {
				g: 0.25,
				filter: fsweep("highpass", 1500, 6000, 0.06),
			}),
		),
		receive: stack(
			sine(sweep(620, 1040), [0.003, 0.07]),
			at(0.075, sine(sweep(1040, 1400), [0.003, 0.09])),
		),
		pop: sine(sweep(320, 980), [0.001, 0.04]),

		// ── status ──
		loading: arp([n("E6"), n("B6"), n("E6"), n("B6")], 0.11, (f) =>
			sine(f, [0.02, 0.07]),
		),
		lock: stack(
			noise("white", 0.008, { filter: bp(2200, 3) }),
			sine(sweep(700, 520), 0.03, { g: 0.6 }),
			at(0.06, noise("white", 0.012, { filter: bp(1400, 3) })),
			at(0.06, sine(380, 0.04, { g: 0.6 })),
		),
		unlock: stack(
			noise("white", 0.012, { filter: bp(1400, 3) }),
			sine(380, 0.03, { g: 0.6 }),
			at(0.06, noise("white", 0.008, { filter: bp(2600, 3) })),
			at(0.06, sine(sweep(700, 900), 0.04, { g: 0.6 })),
		),
	},
};

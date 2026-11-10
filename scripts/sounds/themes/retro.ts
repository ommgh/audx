import type { Layer } from "../../../package/core/src/types";
import {
	arp,
	at,
	crush,
	echo,
	fsweep,
	fx,
	hp,
	n,
	noise,
	sq,
	stack,
	sweep,
	type ThemeDesign,
	tri,
	vibrato,
} from "../dsl";

/**
 * Retro — an 8-bit console. Square and triangle waves, stepped arpeggios and
 * bit-crushed noise. No reverb, no soft edges.
 */

/** Square-wave blip with a hard (but click-free) edge. */
const blip = (
	f: number | { start: number; end: number },
	decay: number,
	g = 1,
): Layer => sq(f, [0.001, decay, 0.6, 0.01], { g });

export const retro: ThemeDesign = {
	name: "retro",
	description:
		"An 8-bit console. Square waves, stepped arpeggios and bit-crushed noise for games and playful dev tools.",
	tags: ["8-bit", "chiptune", "games"],
	loudness: -1,
	sounds: {
		// ── input ──
		click: blip(n("A5"), 0.03),
		tap: blip(n("A6"), 0.014),
		press: tri(sweep(n("A4"), n("A3")), [0.001, 0.04, 0.6, 0.01]),
		release: blip(sweep(n("A4"), n("A5")), 0.03),
		hover: blip(n("C7"), 0.01, 0.5),
		focus: arp([n("C6"), n("E6")], 0.028, (f) => blip(f, 0.024)),
		blur: arp([n("E6"), n("C6")], 0.028, (f) => blip(f, 0.024)),
		type: stack(
			noise("white", 0.012, { filter: hp(2500), fx: [crush(4)] }),
			blip(n("G6"), 0.008, 0.4),
		),
		tick: blip(n("G7"), 0.006, 0.7),

		// ── selection ──
		toggle: arp([n("C5"), n("C6")], 0.035, (f) => blip(f, 0.03)),
		enable: arp([n("C5"), n("E5"), n("G5"), n("C6")], 0.03, (f) =>
			blip(f, 0.026),
		),
		disable: arp([n("C6"), n("G5"), n("E5"), n("C5")], 0.03, (f) =>
			blip(f, 0.026),
		),
		select: arp([n("C6"), n("G6")], 0.04, (f) => blip(f, 0.035)),
		deselect: blip(n("G5"), 0.04),
		tab: tri(n("C6"), [0.001, 0.05, 0.5, 0.01]),

		// ── navigation ──
		open: blip(sweep(220, 900), 0.1),
		close: blip(sweep(900, 220), 0.1),
		expand: arp([n("C5"), n("G5"), n("C6"), n("G6")], 0.022, (f) =>
			blip(f, 0.02),
		),
		collapse: arp([n("G6"), n("C6"), n("G5"), n("C5")], 0.022, (f) =>
			blip(f, 0.02),
		),
		back: blip(sweep(n("E5"), n("A4")), 0.06),
		forward: blip(sweep(n("A4"), n("E5")), 0.06),
		scroll: tri(n("E6"), [0.001, 0.016, 0.5, 0.005]),
		slide: sq(sweep(380, 1300), [0.002, 0.15, 0.4, 0.02], {
			lfo: vibrato(22, 40),
		}),

		// ── editing ──
		copy: arp([n("E6"), n("B6")], 0.04, (f, i) => blip(f, i ? 0.07 : 0.035)),
		paste: arp([n("C7"), n("C6")], 0.04, (f, i) => blip(f, i ? 0.06 : 0.03)),
		undo: stack(
			blip(sweep(1200, 400), 0.05),
			at(0.06, blip(sweep(400, 800), 0.04)),
		),
		clear: noise("white", [0.002, 0.14], {
			filter: fsweep("lowpass", 9000, 1200, 0.14, 1),
			fx: [crush(3)],
		}),
		delete: stack(
			noise("white", [0.002, 0.2], {
				filter: fsweep("lowpass", 6000, 300, 0.2, 1),
				fx: [crush(3)],
			}),
			blip(sweep(500, 80), 0.12, 0.5),
		),
		drag: tri(sweep(n("E4"), n("A4")), [0.002, 0.05, 0.5, 0.01]),
		drop: stack(
			tri(sweep(n("A4"), n("A2")), [0.001, 0.08, 0.4, 0.01]),
			noise("white", 0.03, { g: 0.4, fx: [crush(3)] }),
		),

		// ── feedback ──
		success: arp([n("C5"), n("E5"), n("G5"), n("C6")], 0.06, (f, i) =>
			blip(f, i === 3 ? 0.18 : 0.05),
		),
		complete: arp(
			[n("C5"), n("E5"), n("G5"), n("C6"), n("E6"), n("G6"), n("C7")],
			0.05,
			(f, i) => blip(f, i === 6 ? 0.32 : 0.045),
		),
		error: arp([n("G3"), n("D3")], 0.13, (f, i) => blip(f, i ? 0.2 : 0.11)),
		warning: arp([n("B5"), n("B5"), n("B5")], 0.085, (f) => blip(f, 0.045)),
		deny: arp([n("D3"), n("D3")], 0.09, (f) => blip(f, 0.05)),
		info: stack(
			tri(n("E6"), [0.001, 0.1, 0.5, 0.02]),
			fx(echo(0.08, 0.35, 0.3)),
		),

		// ── notification ──
		notify: stack(
			arp([n("G6"), n("C7")], 0.1, (f, i) => blip(f, i ? 0.14 : 0.07)),
			fx(echo(0.11, 0.3, 0.25)),
		),
		send: blip(sweep(600, 2400), 0.08),
		receive: stack(
			arp([n("E6"), n("A6")], 0.07, (f) => tri(f, [0.001, 0.06, 0.5, 0.01])),
			fx(echo(0.08, 0.25, 0.2)),
		),
		pop: blip(sweep(600, 1800), 0.025),

		// ── status ──
		loading: arp(
			[n("C6"), n("E6"), n("G6"), n("C6"), n("E6"), n("G6")],
			0.055,
			(f) => blip(f, 0.03, 0.7),
		),
		lock: stack(
			noise("white", 0.03, { fx: [crush(3)] }),
			at(0.03, blip(n("A3"), 0.05)),
		),
		unlock: arp([n("A4"), n("E5"), n("A5")], 0.035, (f) => blip(f, 0.025)),
	},
};

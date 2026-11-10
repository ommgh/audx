import type { Layer } from "../../../package/core/src/types";
import {
	arp,
	at,
	bp,
	fsweep,
	lp,
	noise,
	sine,
	sq,
	stack,
	sweep,
	type ThemeDesign,
} from "../dsl";

/**
 * Mechanical — tactile and physical. Keyboard switches, latches, ratchets
 * and relays built from filtered noise and resonant bodies. Almost no melody:
 * feedback sounds use muted pulses and resonant "pings" instead of chimes.
 */

/** A short filtered-noise transient — the atom of every mechanical sound. */
const clack = (freq: number, q = 3, decay = 0.008, g = 1): Layer =>
	noise("white", [0, decay], { g, filter: bp(freq, q) });

/** Low resonant body that gives a click its weight ("thock"). */
const thock = (freq = 170, decay = 0.03, g = 0.8): Layer =>
	sine(sweep(freq * 1.4, freq), [0, decay], { g });

/** Resonant noise ping — reads as metal being struck. */
const ping = (freq: number, decay: number, g = 1): Layer =>
	noise("white", [0, decay], { g, filter: bp(freq, 45) });

/** Muted pulse: square through a low lowpass, like a keyboard synth on mute. */
const muted = (freq: number, decay = 0.07, g = 1): Layer =>
	sq(freq, [0.001, decay], { g, filter: lp(freq * 2.2, 0.7) });

export const mechanical: ThemeDesign = {
	name: "mechanical",
	description:
		"Tactile and physical. Key switches, latches, ratchets and relays made from filtered noise and resonant bodies.",
	tags: ["tactile", "keyboard", "physical"],
	sounds: {
		// ── input ──
		click: stack(clack(3400, 2.5, 0.009), thock(180, 0.028)),
		tap: stack(thock(420, 0.012, 0.7), clack(4000, 2, 0.004, 0.5)),
		press: stack(thock(140, 0.045, 1), clack(1300, 1.5, 0.014, 0.5)),
		release: stack(
			clack(3800, 3, 0.005),
			sine(sweep(600, 1200), 0.015, { g: 0.5 }),
		),
		hover: clack(6500, 8, 0.004, 0.6),
		focus: stack(
			ping(2200, 0.06, 0.6),
			noise("pink", [0.01, 0.02], { filter: bp(1800, 3) }),
		),
		blur: noise("pink", [0.004, 0.025], { filter: bp(1100, 3) }),
		type: stack(clack(2300, 1.8, 0.012), thock(220, 0.016, 0.5)),
		tick: clack(3100, 14, 0.004),

		// ── selection ──
		toggle: stack(clack(2000, 3, 0.01), at(0.028, clack(3200, 3, 0.008))),
		enable: stack(
			clack(1800, 2, 0.01),
			thock(120, 0.05, 0.9),
			at(0.035, ping(2800, 0.06, 0.7)),
		),
		disable: stack(
			clack(2800, 2, 0.01),
			at(0.035, thock(100, 0.06, 0.9)),
			at(0.035, ping(1500, 0.05, 0.6)),
		),
		select: stack(ping(3200, 0.05), clack(2600, 3, 0.006)),
		deselect: stack(clack(1700, 10, 0.016), thock(200, 0.02, 0.5)),
		tab: clack(2600, 18, 0.012),

		// ── navigation ──
		open: stack(
			noise("pink", [0.09, 0.04], {
				filter: fsweep("bandpass", 500, 2800, 0.1, 2),
			}),
			at(0.13, clack(2600, 3, 0.012)),
			at(0.13, thock(200, 0.025, 0.6)),
		),
		close: stack(
			noise("pink", [0.01, 0.09], {
				filter: fsweep("bandpass", 2800, 500, 0.09, 2),
			}),
			at(0.1, thock(120, 0.05, 1)),
			at(0.1, clack(1400, 2, 0.015)),
		),
		expand: arp([2000, 2500, 3000, 3600], 0.026, (f) => clack(f, 12, 0.005)),
		collapse: arp([3600, 3000, 2500, 2000], 0.026, (f) => clack(f, 12, 0.005)),
		back: stack(
			noise("pink", [0.002, 0.05], {
				filter: fsweep("bandpass", 3000, 1200, 0.05, 2),
			}),
			at(0.045, clack(1500, 3, 0.008)),
		),
		forward: stack(
			noise("pink", [0.04, 0.01], {
				filter: fsweep("bandpass", 1200, 3000, 0.045, 2),
			}),
			at(0.045, clack(2800, 3, 0.008)),
		),
		scroll: stack(
			clack(4200, 10, 0.003),
			at(0.014, clack(3800, 10, 0.003, 0.6)),
		),
		slide: noise("pink", [0.06, 0.2], {
			filter: fsweep("lowpass", 300, 1800, 0.2, 0.7),
		}),

		// ── editing ──
		copy: stack(clack(3000, 4, 0.008), at(0.032, clack(3700, 4, 0.008))),
		paste: stack(
			clack(2200, 2, 0.01),
			thock(130, 0.05, 1),
			at(0.035, clack(1600, 3, 0.006, 0.4)),
		),
		undo: arp([3400, 2800, 2200], 0.022, (f) => clack(f, 10, 0.006)),
		clear: noise("white", [0.005, 0.18], {
			filter: fsweep("highpass", 7000, 2000, 0.18, 0.7),
		}),
		delete: stack(
			noise("white", [0.002, 0.09], {
				filter: bp(900, 0.8),
				fx: [{ type: "bitcrusher", bits: 5, mix: 0.6 }],
			}),
			thock(95, 0.07, 1),
		),
		drag: noise("pink", [0.04, 0.08], { filter: lp(650, 1.5) }),
		drop: stack(
			thock(90, 0.07, 1),
			noise("brown", 0.03, { g: 0.7, filter: lp(450) }),
		),

		// ── feedback ──
		success: stack(
			muted(784, 0.07),
			at(0.07, muted(1175, 0.11)),
			at(0.07, clack(3000, 4, 0.006, 0.4)),
		),
		complete: stack(
			muted(784, 0.06),
			at(0.06, muted(988, 0.06)),
			at(0.12, muted(1175, 0.08)),
			at(0.2, ping(3500, 0.45, 1.2)),
			at(0.2, clack(4000, 3, 0.006, 0.5)),
		),
		error: stack(
			sq(150, [0.002, 0.24, 0.5, 0.04], { filter: lp(1600) }),
			sq(141, [0.002, 0.24, 0.5, 0.04], { g: 0.8, filter: lp(1600) }),
			clack(1800, 2, 0.01, 0.5),
		),
		warning: stack(
			sq(220, [0.002, 0.07], { filter: lp(1300) }),
			at(0.11, sq(220, [0.002, 0.08], { filter: lp(1300) })),
		),
		deny: stack(
			thock(120, 0.05, 1),
			noise("pink", 0.02, { g: 0.6, filter: lp(500) }),
			at(0.08, thock(110, 0.06, 1)),
			at(0.08, noise("pink", 0.02, { g: 0.6, filter: lp(500) })),
		),
		info: ping(1850, 0.2),

		// ── notification ──
		notify: stack(
			sine(2637, [0.001, 0.45], { fm: { ratio: 3.7, depth: 380 } }),
			clack(4000, 3, 0.005, 0.4),
			at(
				0.14,
				sine(2637, [0.001, 0.4], { g: 0.7, fm: { ratio: 3.7, depth: 380 } }),
			),
		),
		send: stack(
			noise("pink", [0.07, 0.03], {
				filter: fsweep("bandpass", 700, 4200, 0.08, 1.5),
			}),
			at(0.1, clack(3200, 3, 0.008)),
		),
		receive: stack(
			noise("pink", [0.005, 0.08], {
				filter: fsweep("bandpass", 3800, 700, 0.08, 1.5),
			}),
			at(0.09, thock(200, 0.035, 0.9)),
			at(0.09, clack(2400, 3, 0.008)),
		),
		pop: stack(sine(sweep(850, 300), [0, 0.025]), clack(1500, 2, 0.008, 0.6)),

		// ── status ──
		loading: arp([3100, 2500, 3100, 2500, 3100], 0.12, (f) =>
			clack(f, 12, 0.006),
		),
		lock: stack(
			clack(1300, 2, 0.02),
			thock(150, 0.04, 0.9),
			at(0.05, clack(2600, 4, 0.01)),
		),
		unlock: stack(
			clack(2600, 4, 0.01),
			at(0.05, clack(1300, 2, 0.016)),
			at(0.05, sine(sweep(200, 320), 0.03, { g: 0.6 })),
		),
	},
};

import {
	arp,
	at,
	bp,
	fx,
	lp,
	n,
	noise,
	room,
	saw,
	sine,
	sq,
	stack,
	sweep,
	type ThemeDesign,
	tri,
	vibrato,
} from "../dsl";

/**
 * Playful — bouncy, bright, a little cartoonish. Springy pitch bends, FM
 * "bloops", octave leaps and pentatonic chimes with a touch of room.
 */
const bell = (f: number, decay: number, g = 1) =>
	sine(f, [0.001, decay], { g, fm: { ratio: 2.01, depth: f * 0.35 } });

const marimba = (f: number, decay = 0.09, g = 1) => [
	sine(f, [0.001, decay], { g }),
	sine(f * 4, [0.001, decay * 0.25], { g: g * 0.3 }),
];

export const playful: ThemeDesign = {
	name: "playful",
	description:
		"Bouncy and bright. Springy bloops, marimba taps and pentatonic chimes for consumer apps and games.",
	tags: ["fun", "bright", "bouncy"],
	sounds: {
		// ── input ──
		click: sine(sweep(480, 1250), [0.001, 0.05], {
			fm: { ratio: 2, depth: 60 },
		}),
		tap: sine(sweep(900, 1600), [0.001, 0.028]),
		press: sine(sweep(720, 340), [0.001, 0.07], {
			fm: { ratio: 1.5, depth: 40 },
		}),
		release: sine(sweep(360, 820), [0.001, 0.055], {
			fm: { ratio: 1.5, depth: 40 },
		}),
		hover: sine(sweep(1900, 2500), [0.003, 0.02]),
		focus: tri(sweep(n("C6"), n("G6")), [0.002, 0.06], {
			lfo: vibrato(18, 12),
		}),
		blur: tri(sweep(n("G6"), n("C6")), [0.002, 0.05]),
		type: sine(1250, [0.0005, 0.02], { fm: { ratio: 3.5, depth: 500 } }),
		tick: sine(2600, [0.0005, 0.01], { fm: { ratio: 1.5, depth: 600 } }),

		// ── selection ──
		toggle: sine(sweep(380, 920), [0.001, 0.09], { lfo: vibrato(28, 45) }),
		enable: stack(marimba(n("C6")), at(0.06, marimba(n("G6"), 0.14))),
		disable: stack(marimba(n("G5")), at(0.06, marimba(n("C5"), 0.12))),
		select: bell(n("C7"), 0.14),
		deselect: bell(n("G6"), 0.07, 0.8),
		tab: stack(marimba(n("E6"), 0.07)),

		// ── navigation ──
		open: stack(
			tri(sweep(380, 1400), [0.004, 0.14], { lfo: vibrato(14, 30) }),
			fx(room(0.12, 0.4)),
		),
		close: stack(
			tri(sweep(1400, 380), [0.004, 0.12], { lfo: vibrato(14, 30) }),
			fx(room(0.12, 0.4)),
		),
		expand: arp([n("C6"), n("E6"), n("G6")], 0.03, (f) =>
			sine(f, [0.001, 0.06]),
		),
		collapse: arp([n("G6"), n("E6"), n("C6")], 0.03, (f) =>
			sine(f, [0.001, 0.06]),
		),
		back: tri(sweep(n("G5"), n("C5")), [0.002, 0.08]),
		forward: tri(sweep(n("C5"), n("G5")), [0.002, 0.08]),
		scroll: sine(2000, [0.0005, 0.018], { fm: { ratio: 1.5, depth: 300 } }),
		slide: tri(sweep(520, 1900), [0.01, 0.22], { lfo: vibrato(9, 25) }),

		// ── editing ──
		copy: stack(
			tri(n("C7"), [0.001, 0.04]),
			at(0.055, tri(n("E7"), [0.001, 0.06])),
		),
		paste: sine(sweep(1050, 380), [0.001, 0.09], {
			fm: { ratio: 1, depth: 80 },
		}),
		undo: sine(sweep(1600, 560), [0.002, 0.12], { lfo: vibrato(30, 60) }),
		clear: arp([n("G7"), n("E7"), n("C7"), n("G6")], 0.028, (f) =>
			sine(f, [0.001, 0.05]),
		),
		delete: stack(
			sine(sweep(640, 140), [0.001, 0.14]),
			noise("white", 0.05, { g: 0.45, filter: bp(1400, 1.2) }),
		),
		drag: sine(sweep(300, 640), [0.02, 0.08], { lfo: vibrato(20, 20) }),
		drop: stack(
			sine(sweep(680, 200), [0.001, 0.09]),
			noise("brown", 0.035, { g: 0.6, filter: lp(600) }),
		),

		// ── feedback ──
		success: stack(
			arp([n("C6"), n("E6"), n("G6")], 0.07, (f, i) => [
				tri(f, [0.002, i === 2 ? 0.3 : 0.12]),
				sine(f * 2, [0.002, 0.06], { g: 0.25 }),
			]),
			fx(room(0.15, 0.7)),
		),
		complete: stack(
			arp([n("C6"), n("E6"), n("G6"), n("C7")], 0.075, (f, i) =>
				tri(f, [0.002, i === 3 ? 0.45 : 0.12]),
			),
			at(0.24, bell(n("E7"), 0.35, 0.35)),
			at(0.3, bell(n("G7"), 0.3, 0.25)),
			fx(room(0.2, 0.9)),
		),
		error: stack(
			saw(sweep(n("Eb4"), n("D4")), [0.004, 0.12], {
				filter: lp(1000),
				lfo: vibrato(7, 8),
			}),
			at(
				0.15,
				saw(sweep(n("B3"), n("Bb3")), [0.004, 0.26], {
					filter: lp(900),
					lfo: vibrato(6, 10),
				}),
			),
		),
		warning: stack(
			tri(n("A5"), [0.003, 0.09]),
			at(0.12, tri(n("F5"), [0.003, 0.14])),
		),
		deny: sq(n("G3"), [0.002, 0.16], { filter: lp(900), lfo: vibrato(18, 25) }),
		info: stack(bell(n("G6"), 0.3), fx(room(0.15, 0.6))),

		// ── notification ──
		notify: stack(
			bell(n("G6"), 0.3),
			at(0.11, bell(n("C7"), 0.45)),
			fx(room(0.18, 0.8)),
		),
		send: stack(
			sine(sweep(420, 2000), [0.002, 0.09]),
			at(0.085, sine(n("C7"), [0.001, 0.06], { g: 0.6 })),
		),
		receive: stack(
			sine(sweep(700, 1000), [0.001, 0.06], { fm: { ratio: 1, depth: 50 } }),
			at(
				0.08,
				sine(sweep(1000, 1420), [0.001, 0.08], { fm: { ratio: 1, depth: 50 } }),
			),
		),
		pop: sine(sweep(220, 1250), [0.0005, 0.035], {
			fm: { ratio: 2, depth: 120 },
		}),

		// ── status ──
		loading: arp(
			[n("C6"), n("E6"), n("G6"), n("E6"), n("C6"), n("E6")],
			0.085,
			(f) => sine(f, [0.002, 0.06], { g: 0.8 }),
		),
		lock: stack(
			sine(sweep(520, 240), [0.001, 0.06]),
			noise("white", 0.012, { g: 0.4, filter: bp(1800, 2) }),
		),
		unlock: stack(
			sine(sweep(1400, 2500), [0.001, 0.08], { fm: { ratio: 2, depth: 200 } }),
			noise("white", 0.01, { g: 0.3, filter: bp(3000, 2) }),
		),
	},
};

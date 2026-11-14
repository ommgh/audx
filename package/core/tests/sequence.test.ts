import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { playSequence } from "../src/sequence.js";

/**
 * A stand-in AudioContext whose clock is driven by vitest's fake timers, so
 * `currentTime` advances in lockstep with scheduled timeouts. Steps here use
 * play functions, which the scheduler calls directly without touching any
 * Web Audio nodes.
 */
function fakeContext() {
	const start = Date.now();
	return {
		get currentTime() {
			return (Date.now() - start) / 1000;
		},
	} as unknown as AudioContext;
}

describe("playSequence", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});
	afterEach(() => {
		vi.useRealTimers();
	});

	it("plays every step of a one-shot sequence, including late ones", () => {
		const ctx = fakeContext();
		const calls: string[] = [];
		const step = (name: string) => () => {
			calls.push(name);
			return { stop() {} };
		};

		playSequence(ctx, [
			{ sound: step("a"), at: 0 },
			{ sound: step("b"), at: 0.25 },
			{ sound: step("c"), wait: 0.5 },
		]);

		vi.advanceTimersByTime(2000);
		expect(calls).toEqual(["a", "b", "c"]);
	});

	it("plays late steps at their scheduled time, not early", () => {
		const ctx = fakeContext();
		const playedAt: number[] = [];
		const step = () => {
			playedAt.push(ctx.currentTime);
			return { stop() {} };
		};

		playSequence(ctx, [
			{ sound: step, at: 0 },
			{ sound: step, at: 0.5 },
		]);

		vi.advanceTimersByTime(2000);
		expect(playedAt).toHaveLength(2);
		// setTimeout works in whole milliseconds, so allow a millisecond of slack.
		expect(playedAt[1]).toBeGreaterThanOrEqual(0.499);
		expect(playedAt[1]).toBeLessThan(0.55);
	});

	it("stops scheduling once every step has been scheduled", () => {
		const ctx = fakeContext();
		playSequence(ctx, [
			{ sound: () => ({ stop() {} }), at: 0 },
			{ sound: () => ({ stop() {} }), at: 0.3 },
		]);

		vi.advanceTimersByTime(2000);
		expect(vi.getTimerCount()).toBe(0);
	});

	it("does not play steps that were not reached before stop", () => {
		const ctx = fakeContext();
		const calls: string[] = [];
		const stop = playSequence(ctx, [
			{
				sound: () => {
					calls.push("a");
					return { stop() {} };
				},
				at: 0,
			},
			{
				sound: () => {
					calls.push("b");
					return { stop() {} };
				},
				at: 1,
			},
		]);

		vi.advanceTimersByTime(200);
		stop?.();
		vi.advanceTimersByTime(2000);
		expect(calls).toEqual(["a"]);
	});
});

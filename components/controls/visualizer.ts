"use client";

import type { AudioAnalyser } from "@litlab/audx";
import { createMasterAnalyser } from "@litlab/audx";
import { useCallback, useEffect, useRef } from "react";

const MAX_BARS = 18;
const GAP = 3;
const MIN_BAR_WIDTH = 4;
const FALLBACK_COLOR = "rgba(0,0,0,0.15)";

export function useVisualizer(
	canvasRef: React.RefObject<HTMLCanvasElement | null>,
) {
	const analyserRef = useRef<AudioAnalyser | null>(null);
	const frameRef = useRef<number>(0);
	const activeRef = useRef(false);
	const decayRef = useRef<Float32Array | null>(null);

	const start = useCallback(() => {
		if (!analyserRef.current) {
			analyserRef.current = createMasterAnalyser({
				fftSize: 256,
				smoothingTimeConstant: 0.7,
			});
		}
		activeRef.current = true;

		const draw = () => {
			const canvas = canvasRef.current;
			const analyser = analyserRef.current;
			if (!canvas || !analyser) return;

			const ctx = canvas.getContext("2d");
			if (!ctx) return;

			const dpr = window.devicePixelRatio || 1;
			const w = canvas.clientWidth;
			const h = canvas.clientHeight;

			if (w <= 0 || h <= 0) {
				if (activeRef.current) {
					frameRef.current = requestAnimationFrame(draw);
				}
				return;
			}

			if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
				canvas.width = w * dpr;
				canvas.height = h * dpr;
			}
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

			const freq = analyser.getFrequencyData();
			const maxBarsForWidth = Math.max(
				1,
				Math.floor((w + GAP) / (MIN_BAR_WIDTH + GAP)),
			);
			const barCount = Math.min(freq.length, MAX_BARS, maxBarsForWidth);

			if (!decayRef.current || decayRef.current.length !== barCount) {
				decayRef.current = new Float32Array(barCount);
			}
			const decay = decayRef.current;

			ctx.clearRect(0, 0, w, h);

			const barWidth = Math.max(
				MIN_BAR_WIDTH,
				(w - GAP * (barCount - 1)) / barCount,
			);
			const style = getComputedStyle(canvas);
			const flat = style.getPropertyValue("--vis-color").trim() || "";
			const colorLow = style.getPropertyValue("--vis-color-low").trim() || "";
			const useGradient = !!colorLow;
			const colorMid = style.getPropertyValue("--vis-color-mid").trim() || "";
			const colorHigh = style.getPropertyValue("--vis-color-high").trim() || "";

			let hasSignal = false;

			for (let i = 0; i < barCount; i++) {
				const raw = freq[i] / 255;
				if (raw > decay[i]) {
					decay[i] = raw;
				} else {
					decay[i] *= 0.92;
				}
				if (decay[i] > 0.005) hasSignal = true;

				const barH = Math.max(1, decay[i] * h * 0.95);
				const x = i * (barWidth + GAP);
				const radius = Math.max(0, Math.min(barWidth / 2, barH / 2, 2));

				if (barH > 0.5) {
					ctx.beginPath();
					ctx.roundRect(x, h - barH, barWidth, barH, radius);

					if (useGradient) {
						const grad = ctx.createLinearGradient(0, h, 0, h - barH);
						grad.addColorStop(0, colorLow);
						if (colorMid) grad.addColorStop(0.5, colorMid);
						if (colorHigh) grad.addColorStop(1, colorHigh);
						ctx.fillStyle = grad;
					} else {
						ctx.fillStyle = flat || FALLBACK_COLOR;
					}

					ctx.fill();
				}
			}

			if (hasSignal || activeRef.current) {
				frameRef.current = requestAnimationFrame(draw);
			}
		};

		cancelAnimationFrame(frameRef.current);
		draw();
	}, [canvasRef]);

	const stop = useCallback(() => {
		activeRef.current = false;
		cancelAnimationFrame(frameRef.current);
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
	}, [canvasRef]);

	useEffect(() => {
		return () => {
			cancelAnimationFrame(frameRef.current);
			analyserRef.current?.dispose();
		};
	}, []);

	return { start, stop };
}

"use client";

import {
	type AudioPatch,
	definePatch,
	type PlayOptions,
	type SoundPatch,
} from "@litlab/audx";
import {
	createContext,
	use,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";

type PlayedEvent = { id: number; sound: string; cell?: string };

type ShowcaseContextValue = {
	themes: string[];
	theme: string;
	setTheme: (theme: string) => void;
	muted: boolean;
	setMuted: (muted: boolean) => void;
	play: (sound: string, opts?: PlayOptions & { cell?: string }) => void;
	last: PlayedEvent | null;
	subscribe: (fn: (e: PlayedEvent) => void) => () => void;
};

const ShowcaseContext = createContext<ShowcaseContextValue | null>(null);

export function ShowcaseSoundProvider({
	themes,
	children,
}: {
	themes: Record<string, SoundPatch>;
	children: React.ReactNode;
}) {
	const names = useMemo(() => Object.keys(themes), [themes]);
	const [theme, setTheme] = useState(names[0]);
	const [muted, setMuted] = useState(false);
	const [last, setLast] = useState<PlayedEvent | null>(null);
	const listeners = useRef(new Set<(e: PlayedEvent) => void>());
	const counter = useRef(0);

	const patches = useMemo(() => {
		const out: Record<string, AudioPatch> = {};
		for (const [name, data] of Object.entries(themes))
			out[name] = definePatch(data);
		return out;
	}, [themes]);

	const stateRef = useRef({ theme, muted });
	stateRef.current = { theme, muted };

	const play = useCallback(
		(sound: string, opts?: PlayOptions & { cell?: string }) => {
			const { theme: current, muted: isMuted } = stateRef.current;
			const event = { id: ++counter.current, sound, cell: opts?.cell };
			setLast(event);
			for (const fn of listeners.current) fn(event);
			if (isMuted) return;
			const patch = patches[current];
			if (!patch?.get(sound)) return;
			const { cell: _cell, ...playOpts } = opts ?? {};
			patch.play(sound, playOpts);
		},
		[patches],
	);

	const subscribe = useCallback((fn: (e: PlayedEvent) => void) => {
		listeners.current.add(fn);
		return () => {
			listeners.current.delete(fn);
		};
	}, []);

	const value = useMemo(
		() => ({
			themes: names,
			theme,
			setTheme,
			muted,
			setMuted,
			play,
			last,
			subscribe,
		}),
		[names, theme, muted, play, last, subscribe],
	);

	return <ShowcaseContext value={value}>{children}</ShowcaseContext>;
}

export function useShowcase() {
	const ctx = use(ShowcaseContext);
	if (!ctx)
		throw new Error("useShowcase must be used inside ShowcaseSoundProvider");
	return ctx;
}

const CellContext = createContext<string | undefined>(undefined);
export const CellProvider = CellContext;

/** Plays a sound and attributes it to the surrounding showcase cell. */
export function useCellSound() {
	const { play } = useShowcase();
	const cell = use(CellContext);
	return useCallback(
		(sound: string, opts?: PlayOptions) => play(sound, { ...opts, cell }),
		[play, cell],
	);
}

/** Names of sounds that fired in `cell` within the last few hundred ms. */
export function useActiveSounds(cell: string) {
	const { subscribe } = useShowcase();
	const [active, setActive] = useState<Record<string, number>>({});

	useEffect(
		() =>
			subscribe((e) => {
				if (e.cell !== cell) return;
				setActive((a) => ({ ...a, [e.sound]: e.id }));
				setTimeout(() => {
					setActive((a) => {
						if (a[e.sound] !== e.id) return a;
						const { [e.sound]: _, ...rest } = a;
						return rest;
					});
				}, 450);
			}),
		[subscribe, cell],
	);

	return active;
}

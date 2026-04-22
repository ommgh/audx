"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import {
	PREVIEW_SOUNDS,
	SOUND_PROMPT_TEMPLATES,
} from "@/lib/sound-prompt-templates";
import { SEMANTIC_SOUND_NAMES } from "@/package/src/types";

// ── Types ───────────────────────────────────────────────────────────────────

export type EditorPhase =
	| "idle"
	| "previewing"
	| "preview-ready"
	| "generating"
	| "review"
	| "saving"
	| "saved";

export interface GeneratedSound {
	semanticName: string;
	category: string;
	audioBase64: string | null;
	audioUrl: string | null;
	duration: number;
	status: "pending" | "generating" | "completed" | "failed";
	error?: string;
}

export interface ThemeEditorState {
	phase: EditorPhase;
	themeName: string;
	themePrompt: string;
	sounds: Map<string, GeneratedSound>;
	previewSounds: Map<string, GeneratedSound>;
	progress: { total: number; completed: number; failed: number };
	error: string | null;
	startTime: number | null;
	elapsedMs: number | null;
}

type EditorAction =
	| { type: "SET_THEME_NAME"; name: string }
	| { type: "SET_THEME_PROMPT"; prompt: string }
	| { type: "START_PREVIEW"; sounds: Map<string, GeneratedSound> }
	| { type: "SSE_PROGRESS"; semanticName: string }
	| {
			type: "SSE_COMPLETE";
			semanticName: string;
			audioBase64: string;
			audioUrl: string;
			duration: number;
	  }
	| { type: "SSE_ERROR"; semanticName: string; error: string }
	| {
			type: "SSE_DONE";
			summary: {
				total: number;
				succeeded: number;
				failed: number;
				elapsedMs: number;
			};
	  }
	| { type: "PREVIEW_COMPLETE" }
	| { type: "START_FULL_GENERATION"; sounds: Map<string, GeneratedSound> }
	| { type: "REJECT_PREVIEW" }
	| { type: "START_SAVE" }
	| { type: "SAVE_COMPLETE" }
	| { type: "SET_ERROR"; error: string };

const initialState: ThemeEditorState = {
	phase: "idle",
	themeName: "",
	themePrompt: "",
	sounds: new Map(),
	previewSounds: new Map(),
	progress: { total: 0, completed: 0, failed: 0 },
	error: null,
	startTime: null,
	elapsedMs: null,
};

function base64ToBlobUrl(base64: string): string {
	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	const blob = new Blob([bytes], { type: "audio/mpeg" });
	return URL.createObjectURL(blob);
}

function updateSoundInMap(
	map: Map<string, GeneratedSound>,
	name: string,
	update: Partial<GeneratedSound>,
): Map<string, GeneratedSound> {
	const existing = map.get(name);
	if (!existing) return map;
	const next = new Map(map);
	next.set(name, { ...existing, ...update });
	return next;
}

function reducer(
	state: ThemeEditorState,
	action: EditorAction,
): ThemeEditorState {
	switch (action.type) {
		case "SET_THEME_NAME":
			return { ...state, themeName: action.name };
		case "SET_THEME_PROMPT":
			return { ...state, themePrompt: action.prompt };
		case "START_PREVIEW":
			return {
				...state,
				phase: "previewing",
				previewSounds: action.sounds,
				progress: { total: action.sounds.size, completed: 0, failed: 0 },
				error: null,
				startTime: Date.now(),
				elapsedMs: null,
			};
		case "SSE_PROGRESS": {
			const isPreview = state.phase === "previewing";
			const targetMap = isPreview ? state.previewSounds : state.sounds;
			const updated = updateSoundInMap(targetMap, action.semanticName, {
				status: "generating",
			});
			return isPreview
				? { ...state, previewSounds: updated }
				: { ...state, sounds: updated };
		}
		case "SSE_COMPLETE": {
			const isPreview = state.phase === "previewing";
			const targetMap = isPreview ? state.previewSounds : state.sounds;
			const updated = updateSoundInMap(targetMap, action.semanticName, {
				status: "completed",
				audioBase64: action.audioBase64,
				audioUrl: action.audioUrl,
				duration: action.duration,
			});
			const base = isPreview
				? { ...state, previewSounds: updated }
				: { ...state, sounds: updated };
			return {
				...base,
				progress: {
					...state.progress,
					completed: state.progress.completed + 1,
				},
			};
		}
		case "SSE_ERROR": {
			const isPreview = state.phase === "previewing";
			const targetMap = isPreview ? state.previewSounds : state.sounds;
			const updated = updateSoundInMap(targetMap, action.semanticName, {
				status: "failed",
				error: action.error,
			});
			const base = isPreview
				? { ...state, previewSounds: updated }
				: { ...state, sounds: updated };
			return {
				...base,
				progress: { ...state.progress, failed: state.progress.failed + 1 },
			};
		}
		case "SSE_DONE": {
			const nextPhase = state.phase === "generating" ? "review" : state.phase;
			return {
				...state,
				phase: nextPhase,
				elapsedMs: action.summary.elapsedMs,
			};
		}
		case "PREVIEW_COMPLETE":
			return { ...state, phase: "preview-ready" };
		case "START_FULL_GENERATION":
			return {
				...state,
				phase: "generating",
				sounds: action.sounds,
				progress: { total: action.sounds.size, completed: 0, failed: 0 },
				startTime: Date.now(),
				elapsedMs: null,
			};
		case "REJECT_PREVIEW":
			return {
				...state,
				phase: "idle",
				previewSounds: new Map(),
				progress: { total: 0, completed: 0, failed: 0 },
				error: null,
				startTime: null,
				elapsedMs: null,
			};
		case "START_SAVE":
			return { ...state, phase: "saving", error: null };
		case "SAVE_COMPLETE":
			return { ...state, phase: "saved" };
		case "SET_ERROR":
			return { ...state, error: action.error };
		default:
			return state;
	}
}

async function consumeSSEStream(
	response: Response,
	onEvent: (action: EditorAction) => void,
	abortSignal: AbortSignal,
): Promise<void> {
	const body = response.body;
	if (!body) throw new Error("No response body");

	const reader = body.getReader();
	const decoder = new TextDecoder();
	let buffer = "";

	try {
		while (true) {
			if (abortSignal.aborted) break;
			const { done, value } = await reader.read();
			if (done) break;

			buffer += decoder.decode(value, { stream: true });
			const lines = buffer.split("\n");
			buffer = lines.pop() ?? "";

			for (const line of lines) {
				if (!line.startsWith("data: ")) continue;
				try {
					const event = JSON.parse(line.slice(6));
					switch (event.type) {
						case "progress":
							onEvent({
								type: "SSE_PROGRESS",
								semanticName: event.semanticName,
							});
							break;
						case "complete": {
							const audioUrl = base64ToBlobUrl(event.audioBase64);
							onEvent({
								type: "SSE_COMPLETE",
								semanticName: event.semanticName,
								audioBase64: event.audioBase64,
								audioUrl,
								duration: event.duration,
							});
							break;
						}
						case "error":
							onEvent({
								type: "SSE_ERROR",
								semanticName: event.semanticName,
								error: event.error,
							});
							break;
						case "done":
							onEvent({ type: "SSE_DONE", summary: event.summary });
							break;
					}
				} catch {
					// Skip malformed JSON lines
				}
			}
		}
	} finally {
		reader.releaseLock();
	}
}

function buildSoundMap(names: readonly string[]): Map<string, GeneratedSound> {
	const map = new Map<string, GeneratedSound>();
	for (const name of names) {
		const template =
			SOUND_PROMPT_TEMPLATES[name as keyof typeof SOUND_PROMPT_TEMPLATES];
		if (!template) continue;
		map.set(name, {
			semanticName: name,
			category: template.category,
			audioBase64: null,
			audioUrl: null,
			duration: template.defaultDuration,
			status: "pending",
		});
	}
	return map;
}

export function useThemeEditor(): {
	state: ThemeEditorState;
	setThemeName: (name: string) => void;
	setThemePrompt: (prompt: string) => void;
	startPreview: () => Promise<void>;
	approvePreview: () => Promise<void>;
	rejectPreview: () => void;
	retrySound: (semanticName: string) => Promise<void>;
	saveTheme: () => Promise<void>;
} {
	const [state, dispatch] = useReducer(reducer, initialState);
	const abortRef = useRef<AbortController | null>(null);
	const blobUrlsRef = useRef<string[]>([]);

	useEffect(() => {
		return () => {
			for (const url of blobUrlsRef.current) {
				URL.revokeObjectURL(url);
			}
			blobUrlsRef.current = [];
			abortRef.current?.abort();
		};
	}, []);

	const trackBlobUrl = useCallback((url: string) => {
		blobUrlsRef.current.push(url);
	}, []);

	const setThemeName = useCallback((name: string) => {
		dispatch({ type: "SET_THEME_NAME", name });
	}, []);

	const setThemePrompt = useCallback((prompt: string) => {
		dispatch({ type: "SET_THEME_PROMPT", prompt });
	}, []);

	const fetchSSE = useCallback(
		async (
			soundNames: readonly string[],
			themeName: string,
			themePrompt: string,
			onDone: () => void,
		) => {
			abortRef.current?.abort();
			const controller = new AbortController();
			abortRef.current = controller;

			const sounds = soundNames.map((name) => {
				const template =
					SOUND_PROMPT_TEMPLATES[name as keyof typeof SOUND_PROMPT_TEMPLATES];
				return {
					semanticName: name,
					duration: 1,
				};
			});

			const response = await fetch("/api/generate-theme", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ themeName, themePrompt, sounds }),
				signal: controller.signal,
			});

			if (!response.ok) {
				const text = await response.text();
				throw new Error(text || `HTTP ${response.status}`);
			}

			await consumeSSEStream(
				response,
				(action) => {
					if (action.type === "SSE_COMPLETE" && action.audioUrl) {
						trackBlobUrl(action.audioUrl);
					}
					dispatch(action);
				},
				controller.signal,
			);
			onDone();
		},
		[trackBlobUrl],
	);

	const startPreview = useCallback(async () => {
		if (state.phase !== "idle") return;
		const previewMap = buildSoundMap(PREVIEW_SOUNDS);
		dispatch({ type: "START_PREVIEW", sounds: previewMap });
		try {
			await fetchSSE(PREVIEW_SOUNDS, state.themeName, state.themePrompt, () =>
				dispatch({ type: "PREVIEW_COMPLETE" }),
			);
		} catch (err) {
			if (err instanceof DOMException && err.name === "AbortError") return;
			dispatch({
				type: "SET_ERROR",
				error: err instanceof Error ? err.message : "Preview failed",
			});
		}
	}, [state.phase, state.themeName, state.themePrompt, fetchSSE]);

	const approvePreview = useCallback(async () => {
		if (state.phase !== "preview-ready") return;
		const previewSet = new Set(PREVIEW_SOUNDS);
		const remainingNames = SEMANTIC_SOUND_NAMES.filter(
			(n) => !previewSet.has(n),
		);
		const remainingMap = buildSoundMap(remainingNames);
		dispatch({ type: "START_FULL_GENERATION", sounds: remainingMap });
		try {
			await fetchSSE(remainingNames, state.themeName, state.themePrompt, () => {
				// SSE_DONE from the stream handles elapsed time
			});
		} catch (err) {
			if (err instanceof DOMException && err.name === "AbortError") return;
			dispatch({
				type: "SET_ERROR",
				error: err instanceof Error ? err.message : "Generation failed",
			});
		}
	}, [state.phase, state.themeName, state.themePrompt, fetchSSE]);

	const rejectPreview = useCallback(() => {
		if (state.phase !== "preview-ready") return;
		for (const sound of state.previewSounds.values()) {
			if (sound.audioUrl) {
				URL.revokeObjectURL(sound.audioUrl);
				blobUrlsRef.current = blobUrlsRef.current.filter(
					(u) => u !== sound.audioUrl,
				);
			}
		}
		dispatch({ type: "REJECT_PREVIEW" });
	}, [state.phase, state.previewSounds]);

	const retrySound = useCallback(
		async (semanticName: string) => {
			const template =
				SOUND_PROMPT_TEMPLATES[
					semanticName as keyof typeof SOUND_PROMPT_TEMPLATES
				];
			if (!template) return;
			const isPreview = state.previewSounds.has(semanticName);
			const targetMap = isPreview ? state.previewSounds : state.sounds;
			const sound = targetMap.get(semanticName);
			if (!sound || sound.status !== "failed") return;

			dispatch({ type: "SSE_PROGRESS", semanticName });
			try {
				const response = await fetch("/api/generate-theme", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						themeName: state.themeName,
						themePrompt: state.themePrompt,
						sounds: [{ semanticName, duration: 1 }],
					}),
				});
				if (!response.ok) {
					const text = await response.text();
					throw new Error(text || `HTTP ${response.status}`);
				}
				await consumeSSEStream(
					response,
					(action) => {
						if (action.type === "SSE_COMPLETE" && action.audioUrl) {
							trackBlobUrl(action.audioUrl);
						}
						dispatch(action);
					},
					new AbortController().signal,
				);
			} catch (err) {
				dispatch({
					type: "SSE_ERROR",
					semanticName,
					error: err instanceof Error ? err.message : "Retry failed",
				});
			}
		},
		[
			state.themeName,
			state.themePrompt,
			state.previewSounds,
			state.sounds,
			trackBlobUrl,
		],
	);

	const saveTheme = useCallback(async () => {
		if (state.phase !== "review") return;
		dispatch({ type: "START_SAVE" });
		try {
			const allSounds: Array<{
				semanticName: string;
				audioBase64: string;
				duration: number;
			}> = [];
			for (const sound of state.previewSounds.values()) {
				if (sound.status === "completed" && sound.audioBase64) {
					allSounds.push({
						semanticName: sound.semanticName,
						audioBase64: sound.audioBase64,
						duration: sound.duration,
					});
				}
			}
			for (const sound of state.sounds.values()) {
				if (sound.status === "completed" && sound.audioBase64) {
					allSounds.push({
						semanticName: sound.semanticName,
						audioBase64: sound.audioBase64,
						duration: sound.duration,
					});
				}
			}
			const response = await fetch("/api/save-theme", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					themeName: state.themeName,
					themePrompt: state.themePrompt,
					sounds: allSounds,
				}),
			});
			if (!response.ok) {
				const text = await response.text();
				throw new Error(text || `HTTP ${response.status}`);
			}
			dispatch({ type: "SAVE_COMPLETE" });
		} catch (err) {
			dispatch({
				type: "SET_ERROR",
				error: err instanceof Error ? err.message : "Save failed",
			});
		}
	}, [
		state.phase,
		state.themeName,
		state.themePrompt,
		state.previewSounds,
		state.sounds,
	]);

	return {
		state,
		setThemeName,
		setThemePrompt,
		startPreview,
		approvePreview,
		rejectPreview,
		retrySound,
		saveTheme,
	};
}

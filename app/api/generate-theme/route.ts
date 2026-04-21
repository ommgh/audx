import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { generateThemeRequestSchema } from "@/lib/generate-theme-schema";
import { buildSoundPrompt } from "@/lib/prompt-builder";
import { SOUND_PROMPT_TEMPLATES } from "@/lib/sound-prompt-templates";

const ELEVENLABS_URL = "https://api.elevenlabs.io/v1/sound-generation";
const CONCURRENCY_LIMIT = 2;
const MAX_RETRIES = 2;

function sseEvent(data: Record<string, unknown>): string {
	return `data: ${JSON.stringify(data)}\n\n`;
}

async function generateSingleSound(
	prompt: string,
	duration: number,
	apiKey: string,
	signal: AbortSignal,
): Promise<{ audioBase64: string; duration: number }> {
	let lastError: Error | null = null;

	for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
		if (signal.aborted) {
			throw new Error("Client disconnected");
		}

		let response: Response;
		try {
			response = await fetch(ELEVENLABS_URL, {
				method: "POST",
				headers: {
					"xi-api-key": apiKey,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					text: prompt,
					duration_seconds: duration,
				}),
				signal,
			});
		} catch (error) {
			if (signal.aborted) {
				throw new Error("Client disconnected");
			}
			lastError = error instanceof Error ? error : new Error("Fetch failed");
			if (attempt < MAX_RETRIES) {
				const backoff = attempt === 0 ? 1000 : 3000;
				await sleep(backoff);
				continue;
			}
			throw lastError;
		}

		if (response.ok) {
			const arrayBuffer = await response.arrayBuffer();
			const audioBase64 = Buffer.from(arrayBuffer).toString("base64");
			return { audioBase64, duration };
		}

		if (response.status === 429) {
			const retryAfter = response.headers.get("retry-after");
			const waitMs = retryAfter ? Number(retryAfter) * 1000 : 5000;
			await sleep(waitMs);
			continue;
		}

		if (response.status >= 500) {
			lastError = new Error(`ElevenLabs API error: ${response.status}`);
			if (attempt < MAX_RETRIES) {
				const backoff = attempt === 0 ? 1000 : 3000;
				await sleep(backoff);
				continue;
			}
			throw lastError;
		}

		// Non-429 4xx — fail immediately
		throw new Error(
			`ElevenLabs API error: ${response.status} ${response.statusText}`,
		);
	}

	throw lastError ?? new Error("Max retries exceeded");
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const parsed = generateThemeRequestSchema.parse(body);

		const apiKey = process.env.ELEVENLABS_API_KEY;
		if (!apiKey) {
			return NextResponse.json(
				{ error: "Sound generation is not configured" },
				{ status: 500 },
			);
		}

		// Build prompts for each requested sound
		const soundJobs = parsed.sounds.map((sound) => {
			const template =
				SOUND_PROMPT_TEMPLATES[
					sound.semanticName as keyof typeof SOUND_PROMPT_TEMPLATES
				];
			const promptResult = buildSoundPrompt({
				themePrompt: parsed.themePrompt,
				semanticName: sound.semanticName,
				uxContext: template?.uxContext ?? "",
				category: template?.category ?? "",
			});
			return {
				semanticName: sound.semanticName,
				prompt: promptResult.text,
				duration: sound.duration,
			};
		});

		const stream = new ReadableStream({
			async start(controller) {
				const startTime = Date.now();
				let succeeded = 0;
				let failed = 0;

				// Simple semaphore for concurrency limiting
				let running = 0;
				const queue: Array<() => void> = [];

				function acquire(): Promise<void> {
					if (running < CONCURRENCY_LIMIT) {
						running++;
						return Promise.resolve();
					}
					return new Promise<void>((resolve) => {
						queue.push(() => {
							running++;
							resolve();
						});
					});
				}

				function release(): void {
					running--;
					const next = queue.shift();
					if (next) next();
				}

				async function processSound(job: {
					semanticName: string;
					prompt: string;
					duration: number;
				}): Promise<void> {
					if (request.signal.aborted) return;

					await acquire();
					if (request.signal.aborted) {
						release();
						return;
					}

					try {
						controller.enqueue(
							sseEvent({
								type: "progress",
								semanticName: job.semanticName,
								status: "generating",
							}),
						);

						const result = await generateSingleSound(
							job.prompt,
							job.duration,
							apiKey,
							request.signal,
						);

						succeeded++;
						controller.enqueue(
							sseEvent({
								type: "complete",
								semanticName: job.semanticName,
								audioBase64: result.audioBase64,
								duration: result.duration,
							}),
						);
					} catch (error) {
						if (request.signal.aborted) return;
						failed++;
						const retriesLeft = 0;
						controller.enqueue(
							sseEvent({
								type: "error",
								semanticName: job.semanticName,
								error: error instanceof Error ? error.message : "Unknown error",
								retriesLeft,
							}),
						);
					} finally {
						release();
					}
				}

				try {
					await Promise.all(soundJobs.map((job) => processSound(job)));
				} catch {
					// All errors handled per-sound
				}

				if (!request.signal.aborted) {
					const elapsedMs = Date.now() - startTime;
					controller.enqueue(
						sseEvent({
							type: "done",
							summary: {
								total: soundJobs.length,
								succeeded,
								failed,
								elapsedMs,
							},
						}),
					);
				}

				controller.close();
			},
		});

		return new Response(stream, {
			headers: {
				"Content-Type": "text/event-stream",
				"Cache-Control": "no-cache",
				Connection: "keep-alive",
			},
		});
	} catch (error) {
		if (error instanceof ZodError) {
			return NextResponse.json(
				{ error: "Invalid request", details: error.issues },
				{ status: 400 },
			);
		}

		return NextResponse.json(
			{ error: "An unexpected error occurred" },
			{ status: 500 },
		);
	}
}

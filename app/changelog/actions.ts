"use server";

import { headers } from "next/headers";
import { z } from "zod";
import {
	addSubscriber,
	isSubscribed,
	sendConfirmationEmail,
	verifyConfirmToken,
} from "@/lib/newsletter";

export type SubscribeState =
	| { status: "idle" }
	| { status: "sent" }
	| { status: "error"; message: string };

const emailSchema = z.string().trim().toLowerCase().pipe(z.email().max(320));

/**
 * Best-effort throttle per IP and per email. It lives in the memory of one
 * server instance, so it slows down casual abuse rather than guaranteeing a
 * limit; the confirmation step is what keeps the list clean.
 */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_IP = 5;
const hits = new Map<string, number[]>();

function throttled(key: string, max: number): boolean {
	const now = Date.now();
	const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
	if (recent.length >= max) {
		hits.set(key, recent);
		return true;
	}
	recent.push(now);
	hits.set(key, recent);
	if (hits.size > 5000) {
		for (const [k, v] of hits) {
			if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
		}
	}
	return false;
}

export async function subscribeToChangelog(
	_prev: SubscribeState,
	formData: FormData,
): Promise<SubscribeState> {
	// Honeypot: people never see this field, bots tend to fill it in.
	if (formData.get("website")) return { status: "sent" };

	const parsed = emailSchema.safeParse(formData.get("email") ?? "");
	if (!parsed.success) {
		return { status: "error", message: "Enter a valid email address." };
	}
	const email = parsed.data;

	const h = await headers();
	const ip =
		h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
		h.get("x-real-ip") ||
		"unknown";
	if (throttled(`ip:${ip}`, MAX_PER_IP)) {
		return {
			status: "error",
			message: "Too many attempts. Try again in a few minutes.",
		};
	}
	// One confirmation email per address per window. Reply as if sent, so the
	// form never reveals whether an address is already on the list.
	if (throttled(`email:${email}`, 1)) return { status: "sent" };

	try {
		if (!(await isSubscribed(email))) {
			await sendConfirmationEmail(email);
		}
		return { status: "sent" };
	} catch (err) {
		console.error("[changelog] subscribe failed", err);
		return {
			status: "error",
			message: "Something went wrong. Please try again later.",
		};
	}
}

export type ConfirmState =
	| { status: "idle" }
	| { status: "confirmed" }
	| { status: "error"; message: string };

export async function confirmChangelogSubscription(
	_prev: ConfirmState,
	formData: FormData,
): Promise<ConfirmState> {
	const result = verifyConfirmToken(String(formData.get("token") ?? ""));
	if (!result.ok) {
		return {
			status: "error",
			message:
				result.reason === "expired"
					? "This link has expired. Subscribe again from the changelog to get a new one."
					: "This link isn't valid. Subscribe again from the changelog.",
		};
	}

	try {
		await addSubscriber(result.email);
		return { status: "confirmed" };
	} catch (err) {
		console.error("[changelog] confirm failed", err);
		return {
			status: "error",
			message: "Something went wrong. Please try again in a moment.",
		};
	}
}

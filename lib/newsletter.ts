import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { SITE_URL } from "@/lib/site";

/**
 * Changelog email updates, backed by Resend.
 *
 * Flow: the changelog form asks for an email, we send a confirmation link
 * signed with an HMAC, and only when the person clicks "Confirm" on that page
 * do we add them as a Resend contact in the Changelog segment. Release emails
 * are sent as Resend Broadcasts to that segment, which handle unsubscribes.
 */

const RESEND_API = "https://api.resend.com";

/** Resend segment that holds confirmed changelog subscribers. Not a secret. */
export const CHANGELOG_SEGMENT_ID = "a9897a3b-1b76-4bc1-8fa3-34b2d62e8661";

const FROM = "audx <updates@audx.site>";
const TOKEN_TTL_MS = 48 * 60 * 60 * 1000;

function apiKey(): string {
	const key = process.env.RESEND_API_KEY;
	if (!key) throw new Error("RESEND_API_KEY is not set");
	return key;
}

/**
 * Key for signing confirmation links. Derived from the Resend key so there is
 * no extra secret to configure; rotating the Resend key only invalidates
 * links that haven't been clicked yet.
 */
function signingKey(): Buffer {
	return createHash("sha256")
		.update(`audx-changelog-confirm:${apiKey()}`)
		.digest();
}

function sign(payload: string): string {
	return createHmac("sha256", signingKey()).update(payload).digest("base64url");
}

export function createConfirmToken(email: string, now = Date.now()): string {
	const payload = Buffer.from(
		JSON.stringify({ e: email, x: now + TOKEN_TTL_MS }),
	).toString("base64url");
	return `${payload}.${sign(payload)}`;
}

export type TokenResult =
	| { ok: true; email: string }
	| { ok: false; reason: "invalid" | "expired" };

export function verifyConfirmToken(
	token: string | undefined | null,
	now = Date.now(),
): TokenResult {
	if (!token) return { ok: false, reason: "invalid" };
	const [payload, sig] = token.split(".");
	if (!payload || !sig) return { ok: false, reason: "invalid" };

	const expected = Buffer.from(sign(payload));
	const actual = Buffer.from(sig);
	if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
		return { ok: false, reason: "invalid" };
	}

	try {
		const { e, x } = JSON.parse(
			Buffer.from(payload, "base64url").toString("utf-8"),
		) as { e?: unknown; x?: unknown };
		if (typeof e !== "string" || typeof x !== "number") {
			return { ok: false, reason: "invalid" };
		}
		if (x < now) return { ok: false, reason: "expired" };
		return { ok: true, email: e };
	} catch {
		return { ok: false, reason: "invalid" };
	}
}

async function resend(
	path: string,
	init: { method: string; body?: unknown },
): Promise<Response> {
	return fetch(`${RESEND_API}${path}`, {
		method: init.method,
		headers: {
			Authorization: `Bearer ${apiKey()}`,
			"Content-Type": "application/json",
		},
		body: init.body === undefined ? undefined : JSON.stringify(init.body),
		cache: "no-store",
	});
}

async function failure(res: Response, what: string): Promise<Error> {
	const text = await res.text().catch(() => "");
	return new Error(`Resend ${what} failed (${res.status}): ${text}`);
}

type Contact = { id: string; unsubscribed: boolean };

async function getContact(email: string): Promise<Contact | null> {
	const res = await resend(`/contacts/${encodeURIComponent(email)}`, {
		method: "GET",
	});
	if (res.status === 404) return null;
	if (!res.ok) throw await failure(res, "get contact");
	return (await res.json()) as Contact;
}

/** True when this email is already a confirmed, subscribed contact. */
export async function isSubscribed(email: string): Promise<boolean> {
	const contact = await getContact(email);
	return !!contact && !contact.unsubscribed;
}

/** Adds (or re-subscribes) a confirmed email to the Changelog segment. */
export async function addSubscriber(email: string): Promise<void> {
	const existing = await getContact(email);

	if (!existing) {
		const res = await resend("/contacts", {
			method: "POST",
			body: {
				email,
				unsubscribed: false,
				segments: [{ id: CHANGELOG_SEGMENT_ID }],
			},
		});
		if (!res.ok) throw await failure(res, "create contact");
		return;
	}

	const path = `/contacts/${encodeURIComponent(email)}`;
	if (existing.unsubscribed) {
		const res = await resend(path, {
			method: "PATCH",
			body: { unsubscribed: false },
		});
		if (!res.ok) throw await failure(res, "update contact");
	}

	const res = await resend(`${path}/segments/${CHANGELOG_SEGMENT_ID}`, {
		method: "POST",
	});
	// Already being in the segment is fine.
	if (!res.ok && res.status !== 409) {
		throw await failure(res, "add contact to segment");
	}
}

export async function sendConfirmationEmail(email: string): Promise<void> {
	const url = `${SITE_URL}/changelog/confirm?token=${encodeURIComponent(
		createConfirmToken(email),
	)}`;

	const res = await resend("/emails", {
		method: "POST",
		body: {
			from: FROM,
			to: [email],
			subject: "Confirm your audx changelog subscription",
			html: confirmationHtml(url),
			text: confirmationText(url),
		},
	});
	if (!res.ok) throw await failure(res, "send confirmation");
}

function confirmationText(url: string): string {
	return [
		"Confirm your subscription to audx release notes.",
		"",
		`Open this link to confirm: ${url}`,
		"",
		"The link expires in 48 hours. If you didn't ask for this, ignore this email and you won't hear from us.",
		"",
		"audx · https://audx.site",
	].join("\n");
}

function confirmationHtml(url: string): string {
	return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0a0a0a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border:1px solid #e5e5e5;padding:32px;">
            <tr>
              <td>
                <p style="margin:0 0 24px;font-size:20px;font-weight:700;">audx</p>
                <p style="margin:0 0 12px;font-size:16px;font-weight:600;">Confirm your subscription</p>
                <p style="margin:0 0 24px;font-size:14px;line-height:22px;color:#525252;">
                  You asked to get audx release notes by email: new sounds, themes and CLI updates. Confirm to start receiving them.
                </p>
                <a href="${url}" style="display:inline-block;background:#1447e6;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:10px 18px;">Confirm subscription</a>
                <p style="margin:24px 0 0;font-size:12px;line-height:18px;color:#737373;">
                  This link expires in 48 hours. If you didn't ask for this, ignore this email and you won't hear from us.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

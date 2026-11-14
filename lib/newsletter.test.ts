// @vitest-environment node
import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { createConfirmToken, verifyConfirmToken } = await import(
	"@/lib/newsletter"
);

describe("changelog confirmation tokens", () => {
	beforeAll(() => {
		process.env.RESEND_API_KEY = "re_test_key";
	});

	it("round-trips an email", () => {
		const token = createConfirmToken("dev@example.com");
		expect(verifyConfirmToken(token)).toEqual({
			ok: true,
			email: "dev@example.com",
		});
	});

	it("expires after 48 hours", () => {
		const now = Date.now();
		const token = createConfirmToken("dev@example.com", now);
		const later = now + 48 * 60 * 60 * 1000 + 1;
		expect(verifyConfirmToken(token, later)).toEqual({
			ok: false,
			reason: "expired",
		});
	});

	it("rejects a tampered email", () => {
		const token = createConfirmToken("dev@example.com");
		const [, sig] = token.split(".");
		const forged = Buffer.from(
			JSON.stringify({ e: "attacker@example.com", x: Date.now() + 1e9 }),
		).toString("base64url");
		expect(verifyConfirmToken(`${forged}.${sig}`)).toEqual({
			ok: false,
			reason: "invalid",
		});
	});

	it("rejects tokens signed with another key", () => {
		const token = createConfirmToken("dev@example.com");
		process.env.RESEND_API_KEY = "re_other_key";
		expect(verifyConfirmToken(token).ok).toBe(false);
		process.env.RESEND_API_KEY = "re_test_key";
	});

	it("rejects missing and malformed tokens", () => {
		expect(verifyConfirmToken("").ok).toBe(false);
		expect(verifyConfirmToken(undefined).ok).toBe(false);
		expect(verifyConfirmToken("nodot").ok).toBe(false);
		expect(verifyConfirmToken("a.b.c").ok).toBe(false);
	});
});

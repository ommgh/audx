"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
	type ConfirmState,
	confirmChangelogSubscription,
} from "@/app/changelog/actions";
import { Button, buttonVariants } from "@/components/ui/button";

const initialState: ConfirmState = { status: "idle" };

/**
 * Confirmation needs a click on purpose: email security scanners open links
 * automatically, and that alone must not subscribe anyone.
 */
export function ConfirmSubscription({ token }: { token: string }) {
	const [state, formAction, pending] = useActionState(
		confirmChangelogSubscription,
		initialState,
	);

	return (
		<div className="mx-auto max-w-md space-y-4 px-4 py-16 text-center md:py-24">
			{state.status === "confirmed" ? (
				<>
					<h1 className="text-2xl font-semibold">You&apos;re subscribed</h1>
					<output className="block text-sm text-muted-foreground">
						You&apos;ll get an email when a new version of audx ships. Every
						email has an unsubscribe link.
					</output>
					<Link href="/changelog" className={buttonVariants()}>
						Back to the changelog
					</Link>
				</>
			) : (
				<>
					<h1 className="text-2xl font-semibold">Confirm your subscription</h1>
					<p className="text-sm text-muted-foreground">
						Get audx release notes by email: new sounds, themes and CLI updates.
					</p>
					<form action={formAction}>
						<input type="hidden" name="token" value={token} />
						<Button type="submit" disabled={pending || !token}>
							{pending ? "Confirming…" : "Confirm subscription"}
						</Button>
					</form>
					{state.status === "error" ? (
						<p role="alert" className="text-sm text-destructive">
							{state.message}{" "}
							<Link href="/changelog" className="underline underline-offset-4">
								Go to the changelog
							</Link>
						</p>
					) : null}
					{!token ? (
						<p role="alert" className="text-sm text-destructive">
							This link is missing its token. Subscribe again from the{" "}
							<Link href="/changelog" className="underline underline-offset-4">
								changelog
							</Link>
							.
						</p>
					) : null}
				</>
			)}
		</div>
	);
}

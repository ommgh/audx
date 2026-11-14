"use client";

import { useActionState } from "react";
import {
	type SubscribeState,
	subscribeToChangelog,
} from "@/app/changelog/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: SubscribeState = { status: "idle" };

function UpdatesInput() {
	const [state, formAction, pending] = useActionState(
		subscribeToChangelog,
		initialState,
	);

	return (
		<section id="home" className="-mt-17.5 pt-17.5">
			<div className="min-w-0 space-y-4 px-4 py-8 text-center md:px-8 md:py-16">
				<h2 className="text-2xl font-semibold md:text-3xl lg:text-4xl">
					Changelog
				</h2>
				<p className="text-muted-foreground text-base sm:text-xl">
					See what&apos;s new added, changed, fixed, improved or updated
				</p>

				{state.status === "sent" ? (
					<output className="mx-auto block max-w-sm text-sm text-muted-foreground">
						Check your inbox and click the link to confirm. It can take a minute
						to arrive.
					</output>
				) : (
					<form
						action={formAction}
						className="mx-auto w-full max-w-sm min-w-0 space-y-2"
					>
						<div className="flex w-full min-w-0 gap-3 max-sm:flex-col max-sm:items-stretch">
							<label htmlFor="changelog-email" className="sr-only">
								Email address
							</label>
							<Input
								id="changelog-email"
								name="email"
								type="email"
								inputMode="email"
								autoComplete="email"
								required
								maxLength={320}
								placeholder="Your email"
								className="input-lg px-3"
								aria-invalid={state.status === "error" || undefined}
								aria-describedby={
									state.status === "error" ? "changelog-email-error" : undefined
								}
							/>
							{/* Honeypot: hidden from people and assistive tech. */}
							<input
								type="text"
								name="website"
								tabIndex={-1}
								autoComplete="off"
								aria-hidden="true"
								className="absolute -left-[9999px] h-px w-px opacity-0"
							/>
							<Button type="submit" disabled={pending}>
								{pending ? "Subscribing…" : "Subscribe"}
							</Button>
						</div>
						{state.status === "error" ? (
							<p
								id="changelog-email-error"
								role="alert"
								className="text-left text-xs text-destructive"
							>
								{state.message}
							</p>
						) : (
							<p className="text-left text-xs text-muted-foreground">
								Release notes only. Unsubscribe anytime.
							</p>
						)}
					</form>
				)}
			</div>
		</section>
	);
}

export default UpdatesInput;

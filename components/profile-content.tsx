"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTRPC } from "@/trpc/client";

export function ProfileContent() {
	const trpc = useTRPC();
	const { data, isLoading, error } = useQuery(
		trpc.profile.getProfile.queryOptions(),
	);
	const [isUpgrading, setIsUpgrading] = useState(false);

	const handleUpgrade = async () => {
		setIsUpgrading(true);
		try {
			const res = await fetch("/api/payments/checkout", { method: "POST" });
			const json = await res.json();
			if (json.url) {
				window.location.href = json.url;
			} else {
				console.error("No checkout URL returned", json);
				setIsUpgrading(false);
			}
		} catch (err) {
			console.error("Checkout error:", err);
			setIsUpgrading(false);
		}
	};

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="h-8 w-48 animate-pulse rounded bg-muted" />
				<div className="h-4 w-64 animate-pulse rounded bg-muted" />
				<div className="mt-8 space-y-3">
					<div className="h-16 animate-pulse rounded bg-muted" />
					<div className="h-16 animate-pulse rounded bg-muted" />
					<div className="h-16 animate-pulse rounded bg-muted" />
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
				Failed to load profile data. Please try again later.
			</div>
		);
	}

	if (!data) return null;

	return (
		<div className="space-y-10">
			<section>
				<h1 className="text-2xl font-bold tracking-tight">{data.user.name}</h1>
				<p className="mt-1 text-sm text-muted-foreground">{data.user.email}</p>
			</section>

			<section>
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-semibold tracking-tight">Plan</h2>
					{data.plan.isPro ? (
						<span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2.5"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="h-3 w-3"
								aria-hidden="true"
							>
								<path d="M20 6 9 17l-5-5" />
							</svg>
							Pro
						</span>
					) : (
						<span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
							Free
						</span>
					)}
				</div>

				{data.plan.isPro ? (
					<div className="mt-3 rounded-md border border-emerald-500/20 bg-emerald-500/5 p-4">
						<p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
							You have AudX Pro
						</p>
						{data.plan.payments[0] && (
							<p className="mt-0.5 text-xs text-muted-foreground">
								Purchased on{" "}
								{new Date(data.plan.payments[0].createdAt).toLocaleDateString(
									undefined,
									{ year: "numeric", month: "long", day: "numeric" },
								)}
							</p>
						)}
					</div>
				) : (
					<div className="mt-3 rounded-md border p-4">
						<p className="text-sm text-muted-foreground">
							Upgrade to Pro to unlock all features.
						</p>
						<button
							type="button"
							onClick={handleUpgrade}
							disabled={isUpgrading}
							className="mt-3 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
						>
							{isUpgrading ? (
								<>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
										className="h-4 w-4 animate-spin"
										aria-hidden="true"
									>
										<path d="M21 12a9 9 0 1 1-6.219-8.56" />
									</svg>
									Redirecting...
								</>
							) : (
								"Upgrade to Pro"
							)}
						</button>
					</div>
				)}
			</section>

			<section>
				<h2 className="text-lg font-semibold tracking-tight">Themes</h2>
				{data.themes.length === 0 ? (
					<p className="mt-2 text-sm text-muted-foreground">
						No themes generated yet.
					</p>
				) : (
					<ul className="mt-3 divide-y divide-border">
						{data.themes.map((theme) => (
							<li
								key={theme.id}
								className="flex items-center justify-between py-3"
							>
								<div>
									<p className="text-sm font-medium">{theme.name}</p>
									<p className="text-xs text-muted-foreground">
										{new Date(theme.createdAt).toLocaleDateString()}
									</p>
								</div>
								<span className="text-xs text-muted-foreground">
									{theme.assetCount} sounds
								</span>
							</li>
						))}
					</ul>
				)}
			</section>

			<section>
				<h2 className="text-lg font-semibold tracking-tight">Sounds</h2>
				{data.sounds.length === 0 ? (
					<p className="mt-2 text-sm text-muted-foreground">
						No sounds generated yet.
					</p>
				) : (
					<ul className="mt-3 divide-y divide-border">
						{data.sounds.map((sound) => (
							<li
								key={sound.id}
								className="flex items-center justify-between py-3"
							>
								<div>
									<p className="text-sm font-medium">{sound.prompt}</p>
									<p className="text-xs text-muted-foreground">
										{new Date(sound.createdAt).toLocaleDateString()}
									</p>
								</div>
								<span className="text-xs text-muted-foreground">
									{sound.duration.toFixed(1)}s
								</span>
							</li>
						))}
					</ul>
				)}
			</section>
		</div>
	);
}

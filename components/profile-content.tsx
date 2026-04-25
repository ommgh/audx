"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export function ProfileContent() {
	const trpc = useTRPC();
	const { data, isLoading, error } = useQuery(
		trpc.profile.getProfile.queryOptions(),
	);

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

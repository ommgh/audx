import Link from "next/link";
import { requireAuth } from "@/lib/auth-utils";

export default async function SuccessPage() {
	await requireAuth();

	return (
		<main className="flex min-h-svh items-center justify-center px-4">
			<div className="flex max-w-md flex-col items-center gap-6 text-center">
				<div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="h-8 w-8 text-emerald-500"
						aria-hidden="true"
					>
						<path d="M20 6 9 17l-5-5" />
					</svg>
				</div>

				<div className="space-y-2">
					<h1 className="text-2xl font-bold tracking-tight">
						Payment successful
					</h1>
					<p className="text-sm text-muted-foreground">
						Welcome to{" "}
						<span className="font-semibold text-foreground">AudX Pro</span>.
						Your account has been upgraded.
					</p>
				</div>

				<div className="flex flex-col gap-2 w-full sm:flex-row sm:justify-center">
					<Link
						href="/profile"
						className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
					>
						View your profile
					</Link>
					<Link
						href="/generate"
						className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
					>
						Start generating
					</Link>
				</div>
			</div>
		</main>
	);
}

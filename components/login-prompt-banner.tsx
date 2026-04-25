"use client";

import { RiCloseLine } from "@remixicon/react";
import Link from "next/link";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function LoginPromptBanner() {
	const { data: session, isPending } = authClient.useSession();
	const [dismissed, setDismissed] = useState(false);

	if (isPending || session || dismissed) {
		return null;
	}

	return (
		<div className="flex items-center justify-between gap-4 border border-border/50 bg-muted/50 px-4 py-3 text-sm">
			<p className="text-muted-foreground">
				Sign in to save your generated sounds and themes
			</p>
			<div className="flex items-center gap-3">
				<Link
					href="/login"
					className="inline-flex items-center font-medium text-primary underline-offset-4 hover:underline"
				>
					Log in
				</Link>
				<button
					type="button"
					onClick={() => setDismissed(true)}
					className="text-muted-foreground hover:text-foreground transition-colors"
					aria-label="Dismiss banner"
				>
					<RiCloseLine size={18} />
				</button>
			</div>
		</div>
	);
}

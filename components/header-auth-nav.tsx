"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function HeaderAuthNav() {
	const { data: session, isPending } = authClient.useSession();
	const router = useRouter();

	if (isPending) {
		return <div className="h-8 w-20 animate-pulse rounded bg-muted" />;
	}

	if (session) {
		return (
			<div className="flex items-center gap-2">
				<Link
					href="/profile"
					className="text-sm text-muted-foreground hover:text-foreground transition-colors"
				>
					{session.user.name || "Profile"}
				</Link>
				<button
					type="button"
					onClick={async () => {
						await authClient.signOut();
						router.push("/");
					}}
					className="text-sm text-muted-foreground hover:text-foreground transition-colors"
				>
					Sign out
				</button>
			</div>
		);
	}

	return (
		<Link
			href="/login"
			className="text-sm text-muted-foreground hover:text-foreground transition-colors"
		>
			Log in
		</Link>
	);
}

import { RiSparklingLine } from "@remixicon/react";
import Link from "next/link";
import { AppLogo } from "@/components/app-logo";
import { GithubStartsButton } from "@/components/github-button";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
	return (
		<header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-sm">
			<div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-6 border-x">
				<AppLogo />
				<nav className="flex items-center gap-4">
					<Link
						href="/themes"
						className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
					>
						Themes
					</Link>
				</nav>
				<div className="flex items-center gap-2">
					<ThemeToggle />
					<GithubStartsButton />
					<Link
						href="/generate"
						className="inline-flex items-center gap-1.5 rounded-md bg-foreground text-background px-3 py-1.5 text-sm font-medium"
					>
						<RiSparklingLine size={16} />
						Generate
					</Link>
				</div>
			</div>
		</header>
	);
}

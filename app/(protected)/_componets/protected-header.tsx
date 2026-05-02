import { AppLogo } from "@/components/app-logo";
import { HeaderAuthNav } from "@/components/header-auth-nav";
import { ThemeToggle } from "@/components/theme-toggle";

export function ProtectedHeader() {
	return (
		<header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-sm">
			<div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-6 border-x">
				<AppLogo />
				<div className="flex items-center gap-2">
					<ThemeToggle />
					<HeaderAuthNav />
				</div>
			</div>
		</header>
	);
}

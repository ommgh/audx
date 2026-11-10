import Link from "next/link";
import { RiHistoryLine } from "@remixicon/react";
import { AppLogo } from "@/components/app-logo";
import { GithubStartsButton } from "@/components/github-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-6 border-x">
        <AppLogo />
        <div className="flex items-center gap-2">
          <Link
            href="/showcase"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "text-muted-foreground hover:text-foreground",
            )}
          >
            Showcase
          </Link>
          <Link
            href="/changelog"
            className={cn(buttonVariants({ variant: "outline", size: "icon" }))}
            aria-label="Changelog"
          >
            <RiHistoryLine size={16} />
          </Link>
          <ThemeToggle />
          <GithubStartsButton />
        </div>
      </div>
    </header>
  );
}

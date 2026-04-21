import Link from "next/link";
import type { ThemeCatalogItem } from "@/lib/theme-data";

interface ThemeCardProps {
	theme: ThemeCatalogItem;
}

export function ThemeCard({ theme }: ThemeCardProps) {
	return (
		<Link
			href={`/themes/${theme.name}`}
			className="group flex flex-col gap-3 rounded-xl border border-border/50 bg-card p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/[0.08] transition-[border-color,box-shadow] duration-200 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
		>
			<h2 className="text-lg font-semibold">{theme.displayName}</h2>
			<p className="text-sm text-muted-foreground line-clamp-2">
				{theme.description}
			</p>
			<span className="mt-auto text-xs text-muted-foreground">
				{theme.mappedCount}/{theme.soundCount} sounds mapped
			</span>
		</Link>
	);
}

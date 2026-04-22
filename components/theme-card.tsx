import type { ThemeCatalogItem } from "@/lib/theme-data";

interface ThemeCardProps {
	theme: ThemeCatalogItem;
}

export function ThemeCard({ theme }: ThemeCardProps) {
	return (
		<div className="group flex flex-col gap-3 rounded-xl border border-border/50 bg-card p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/[0.08] transition-[border-color,box-shadow] duration-200">
			<h2 className="text-lg font-semibold">{theme.displayName}</h2>
			<p className="text-sm text-muted-foreground line-clamp-2">
				{theme.description}
			</p>
			<span className="mt-auto text-xs text-muted-foreground">
				{theme.mappedCount}/{theme.soundCount} sounds mapped
			</span>
		</div>
	);
}

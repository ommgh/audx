"use client";

import { Badge } from "@/components/ui/badge";
import { useHorizontalScroll } from "@/hooks/use-horizontal-scroll";
import type { CategoryCount } from "@/lib/theme-data";

interface CategoryBarProps {
	categories: CategoryCount[];
	selectedCategory: string | null;
	onCategoryChange: (category: string | null) => void;
}

function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

export function CategoryBar({
	categories,
	selectedCategory,
	onCategoryChange,
}: CategoryBarProps) {
	const { ref, isGrabbing } = useHorizontalScroll<HTMLDivElement>();

	return (
		<div
			ref={ref}
			className={`flex gap-3 overflow-x-auto scrollbar-none ${isGrabbing ? "cursor-grabbing" : "cursor-grab"}`}
		>
			{categories.map((cat) => {
				const isActive = selectedCategory === cat.name;
				return (
					<Badge
						key={cat.name}
						variant={isActive ? "default" : "outline"}
						className="shrink-0 cursor-pointer select-none p-3"
						onClick={() => onCategoryChange(isActive ? null : cat.name)}
					>
						{capitalize(cat.name)} ({cat.count})
					</Badge>
				);
			})}
		</div>
	);
}

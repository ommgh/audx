"use client";

import { RiAddLine } from "@remixicon/react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NewThemeButton() {
	return (
		<Link
			href="/themes/create"
			className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
		>
			<RiAddLine data-icon="inline-start" />
			New Theme
		</Link>
	);
}

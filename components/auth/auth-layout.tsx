import { RiArrowLeftLine } from "@remixicon/react";
import Image from "next/image";
import Link from "next/link";

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<main className="relative flex min-h-screen">
			<Link
				href="/"
				className="absolute border top-5 left-5 z-10 inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
				aria-label="Back to home"
			>
				<RiArrowLeftLine size={20} />
			</Link>

			<div className="flex w-full flex-col items-center justify-center px-6 py-12 sm:px-12 lg:w-1/2">
				<div className="w-full max-w-md">{children}</div>
			</div>

			<div className="relative hidden lg:block lg:w-1/2">
				<Image
					src="https://res.cloudinary.com/dcwsgwsfw/image/upload/v1766788560/samples/ash-EYx3CulRcJE-unsplash_t5l7vo.jpg"
					alt="Authentication background"
					fill
					className="object-cover"
					priority
				/>
			</div>
		</main>
	);
};

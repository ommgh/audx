import Image from "next/image";
import Link from "next/link";

export const AppLogo = () => {
	return (
		<Link href="/" className="flex items-center gap-1">
			<Image src="/audx-logo.svg" alt="logo" height={28} width={28} />
			<span className="font-display text-lg font-bold mb-0.5">audx</span>
		</Link>
	);
};

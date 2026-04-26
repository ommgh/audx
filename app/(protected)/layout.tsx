import { ProtectedHeader } from "@/app/(protected)/_componets/protected-header";

export default function ProtectedLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="flex min-h-svh flex-col">
			<ProtectedHeader />
			{children}
		</div>
	);
}

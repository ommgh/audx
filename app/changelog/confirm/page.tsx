import type { Metadata } from "next";
import { ConfirmSubscription } from "@/components/changelog/confirm-subscription";
import { Header } from "@/components/header";

export const metadata: Metadata = {
	title: "Confirm subscription",
	robots: { index: false, follow: false },
};

export default async function ConfirmPage({
	searchParams,
}: {
	searchParams: Promise<{ token?: string | string[] }>;
}) {
	const { token } = await searchParams;
	return (
		<div className="flex min-h-svh min-w-0 flex-col overflow-x-hidden">
			<Header />
			<section className="mx-auto w-full max-w-6xl min-w-0 flex-1 border-x">
				<ConfirmSubscription token={typeof token === "string" ? token : ""} />
			</section>
		</div>
	);
}

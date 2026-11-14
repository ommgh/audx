import type { Metadata } from "next";
import { ProfileContent } from "@/components/profile-content";
import { requireAuth } from "@/lib/auth-utils";

/** Signed-in / transactional page: keep it out of search results. */
export const metadata: Metadata = {
	title: "Profile",
	robots: { index: false, follow: false },
};

const Page = async () => {
	await requireAuth();

	return (
		<main className="max-w-6xl mx-auto border-x border-border min-h-dvh p-4">
			<ProfileContent />
		</main>
	);
};

export default Page;

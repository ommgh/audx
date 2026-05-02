import { ProfileContent } from "@/components/profile-content";
import { requireAuth } from "@/lib/auth-utils";

const Page = async () => {
	await requireAuth();

	return (
		<main className="mx-auto w-full max-w-6xl border-x px-6 py-10">
			<ProfileContent />
		</main>
	);
};

export default Page;

import { ProfileContent } from "@/components/profile-content";
import { requireAuth } from "@/lib/auth-utils";

const Page = async () => {
  await requireAuth();

  return (
    <main className="max-w-6xl mx-auto border-x border-border min-h-dvh p-4">
      <ProfileContent />
    </main>
  );
};

export default Page;

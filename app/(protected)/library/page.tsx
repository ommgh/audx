import type { Metadata } from "next";
import { headers } from "next/headers";

import { getThemesAllTime } from "@/lib/data/themes";
import { getUserThemes, type UserThemeWithStats } from "@/lib/data/user-themes";
import { auth } from "@/lib/auth";
import { View } from "./_components/view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Library",
  description: "Browse and discover curated sound themes for your UI.",
  alternates: { canonical: "https://audx.site/library" },
  openGraph: {
    title: "Library",
    description: "Browse and discover curated sound themes for your UI.",
    url: "https://audx.site/library",
  },
};

export default async function ThemesPage() {
  const [themes, session] = await Promise.all([
    getThemesAllTime(),
    auth.api.getSession({
      headers: await headers(),
    }),
  ]);

  let userThemes: UserThemeWithStats[] = [];
  if (session?.user?.id) {
    userThemes = await getUserThemes(session.user.id);
  }

  return (
    <View themes={themes} userThemes={userThemes} isLoggedIn={!!session} />
  );
}

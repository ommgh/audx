import type { Metadata } from "next";
import { notFound } from "next/navigation";
import * as View from "./_components/view";
import { getThemeByName, getThemeSounds } from "@/lib/data/themes";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ name: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const theme = await getThemeByName(name);
  if (!theme) return { title: "Not Found" };

  const title = `${theme.name} by ${theme.author}`;
  const url = `https://audx.site/library/${name}`;

  return {
    title,
    description: theme.description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: theme.description ?? undefined,
      url,
    },
  };
}

export default async function Page({ params }: Props) {
  const { name } = await params;

  const theme = await getThemeByName(name);

  if (!theme) notFound();

  const sounds = await getThemeSounds(theme.id);

  return (
    <View.Root theme={theme} sounds={sounds}>
      <View.Breadcrumb />
      <View.Main>
        <View.Header />
        <View.Install />
        <View.Sounds />
      </View.Main>
    </View.Root>
  );
}

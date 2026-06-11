import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getThemeByName, getThemeSounds } from "@/lib/data/themes";
import { getUserThemeByName, getUserThemeSounds } from "@/lib/data/user-themes";
import * as View from "./_components/view";

export const dynamic = "force-dynamic";

type Props = {
	params: Promise<{ name: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { name } = await params;
	let theme = await getThemeByName(name);

	if (!theme) {
		const session = await auth.api.getSession({ headers: await headers() });
		if (session?.user?.id) {
			theme = await getUserThemeByName(session.user.id, name);
		}
	}

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

	const presetTheme = await getThemeByName(name);

	if (presetTheme) {
		const sounds = await getThemeSounds(presetTheme.id);

		return (
			<View.Root theme={presetTheme} sounds={sounds}>
				<View.Breadcrumb />
				<View.Main>
					<View.Header />
					<View.Install />
					<View.Sounds />
				</View.Main>
			</View.Root>
		);
	}

	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user?.id) notFound();

	const theme = await getUserThemeByName(session.user.id, name);
	if (!theme) notFound();

	const sounds = await getUserThemeSounds(theme.id);

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

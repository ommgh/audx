import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SoundDetailPage } from "@/components/audio-detail-page";
import { Header } from "@/components/header";
import { getAllAudio, getAudioByName } from "@/lib/audio-data";

interface PageProps {
  params: Promise<{ name: string[] }>;
}

function buildLookupName(segments: string[]): string {
  // URL: /audio/minimal/alert → segments: ["minimal", "alert"]
  // Lookup key: "audio/minimal/alert"
  return `audio/${segments.join("/")}`;
}

export async function generateStaticParams() {
  return getAllAudio().map((s) => {
    // s.name is "audio/minimal/alert" → strip "audio/" prefix and split
    const withoutPrefix = s.name.replace(/^audio\//, "");
    return { name: withoutPrefix.split("/") };
  });
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { name } = await params;
  const lookupName = buildLookupName(name);
  const audio = getAudioByName(lookupName);
  if (!audio) return {};

  const title = `${audio.title} - UI Audio Effect`;
  const description =
    audio.description ||
    `${audio.title} is a free UI audio effect. Duration: ${audio.meta.duration.toFixed(2)}s. Install with a single CLI command.`;

  const urlPath = name.join("/");

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://audx.site/audio/${urlPath}`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    alternates: {
      canonical: `https://audx.site/audio/${urlPath}`,
    },
  };
}

export default async function AudioDetailPage({ params }: PageProps) {
  const { name } = await params;
  const lookupName = buildLookupName(name);
  const audio = getAudioByName(lookupName);
  if (!audio) notFound();

  return (
    <div className="flex min-h-svh flex-col">
      <Header />
      <SoundDetailPage audio={audio} />
    </div>
  );
}

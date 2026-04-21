import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SoundDetailPage } from "@/components/sound-detail-page";
import { getAllAudio, getAudioByName } from "@/lib/audio-data";

interface PageProps {
  params: Promise<{ name: string }>;
}

export async function generateStaticParams() {
  return getAllAudio().map((s) => ({ name: s.name }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { name } = await params;
  const audio = getAudioByName(name);
  if (!audio) return {};

  const title = `${audio.title} - UI Audio Effect`;
  const description =
    audio.description ||
    `${audio.title} is a free UI audio effect. Duration: ${audio.meta.duration.toFixed(2)}s. Install with a single CLI command.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://audx.dev/sound/${name}`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    alternates: {
      canonical: `https://audx.dev/sound/${name}`,
    },
  };
}

export default async function AudioDetailPage({ params }: PageProps) {
  const { name } = await params;
  const audio = getAudioByName(name);
  if (!audio) notFound();

  return <SoundDetailPage audio={audio} />;
}

import { AudioPage } from "@/components/sounds-page";
import { getAllAudio } from "@/lib/audio-data";

export default function Home() {
  const items = getAllAudio();
  return <AudioPage items={items} />;
}

import Link from "next/link";

import Accordion from "@/components/changelog/badge-accordian";
import TimelineItem from "@/components/changelog/timeline";
import { buttonVariants } from "@/components/ui/button";
import { accordionDataV0_8_5 } from "./changelog-data";

function v0_8_5() {
  return (
    <div className="w-full min-w-0">
      <TimelineItem date="June 13, 2026" version="v0.8.5">
        <div className="w-full min-w-0 space-y-4 break-words">
          <div className="space-y-3">
            <h3 className="text-xl font-semibold">
              Sound editor and theme generator
            </h3>
            <p className="text-muted-foreground text-sm">
              Customize sounds on audx.site, then install your version with one
              command. This release covers 0.8.0 through 0.8.5.
            </p>
          </div>
          <img
            src="/c/c-theme-editor.png"
            alt="Theme generator with a tone pad, length and volume knobs, motion slider and waveform picker"
            className="h-auto max-w-full"
          />
          <p className="text-muted-foreground text-sm">
            The sound editor lets you reshape any sound with a mixer and an XY
            pad while you hear the result. The theme generator works one level
            up: pick where a theme sits between soft and bold, warm and bright,
            set its length, volume and motion, choose a waveform, and it builds
            every sound to match.
          </p>
          <p className="text-muted-foreground text-sm">
            Generated themes are saved to your library. When you&apos;re happy
            with a sound, the site gives you an{" "}
            <code className="font-mono">audx add</code> command that writes
            your customized version into your project.
          </p>
          <Link className={buttonVariants()} href="/editor">
            Open the editor
          </Link>
          <Accordion data={accordionDataV0_8_5} />
        </div>
      </TimelineItem>
    </div>
  );
}

export default v0_8_5;

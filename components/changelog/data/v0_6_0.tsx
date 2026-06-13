import TimelineItem from "@/components/changelog/timeline";
import Accordion from "@/components/changelog/badge-accordian";
import CopyCode from "@/components/changelog/copy-code";
import { accordionDataV0_6_0 } from "./changelog-data";
import {
  RiPlayListLine,
  RiSpeakAiLine,
  RiSpeaker2Line,
  RiSpeaker3Line,
} from "@remixicon/react";

function v0_6_0() {
  return (
    <div className="w-full min-w-0">
      <TimelineItem date="March 22, 2024" version="v0.6.0">
        <div className="w-full min-w-0 space-y-4 break-words">
          <h3 className="text-xl font-semibold">Real-time Previews</h3>
          <p className="text-muted-foreground text-sm">
            Audx now brings a fully-featured live preview engine and enhanced
            exporting capabilities right into your browser.
          </p>
          <div className="space-y-3">
            <ul className="text-muted-foreground list-inside list-disc space-y-3 text-sm">
              <li>Preview complex audio effects in real-time</li>
              <li>Seamless collaboration and sharing</li>
            </ul>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              {/* plugin 1 */}
              <div className="flex items-center gap-1.5 rounded-md bg-amber-600/10 px-3 py-1 dark:bg-amber-400/10">
                <RiPlayListLine className="size-4" />
                <span className="text-xs font-medium">MP3</span>
              </div>
              {/* plugin 2 */}
              <div className="flex items-center gap-1.5 rounded-md bg-sky-600/10 px-3 py-1 dark:bg-sky-400/10">
                <RiSpeaker2Line className="size-4" />
                <span className="text-xs font-medium">WAV</span>
              </div>
              {/* plugin 3 */}
              <div className="bg-destructive/10 flex items-center gap-1.5 rounded-md px-3 py-1">
                <RiSpeaker3Line className="size-4 text-destructive" />
                <span className="text-xs font-medium">AAX</span>
              </div>
            </div>
          </div>
          <CopyCode />
          <p className="text-muted-foreground text-sm">
            The updated dashboard streamlines your workflow, letting you preview
            heavy effects across multiple tracks instantly. We've optimized the
            underlying audio engine to deliver a zero-latency experience even
            when running high-fidelity processing plugins.
          </p>
          <Accordion data={accordionDataV0_6_0} />
        </div>
      </TimelineItem>
    </div>
  );
}

export default v0_6_0;

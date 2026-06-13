import TimelineItem from "@/components/changelog/timeline";
import Accordion from "@/components/changelog/badge-accordian";
import { accordionDataV0_5_0 } from "./changelog-data";

function v0_5_0() {
  return (
    <div className="w-full min-w-0">
      <TimelineItem date="November 7, 2023" version="v0.5.0">
        <div className="w-full min-w-0 space-y-4 break-words">
          <div className="space-y-3">
            <h3 className="text-xl font-semibold">
              Advanced Audio Engine & Project Sharing (Beta)
            </h3>
            <p className="text-muted-foreground text-sm">
              We’re launching our completely rebuilt audio engine, offering
              lower latency and a new way to share project links seamlessly
              across teams.
            </p>
          </div>
          <div className="space-y-3">
            <p className="font-medium">Now you can:</p>
            <ul className="text-muted-foreground list-inside list-disc space-y-3 text-sm">
              <li>Experience fluid playback with smarter audio buffering</li>
              <li>Analyze your tracks with a global spectrum analyzer</li>
              <li>Quickly prototype ideas using preset ambient soundscapes</li>
            </ul>
          </div>
          <img
            src="/c/c-audio-engine.png"
            alt="Audio Engine Overview"
            className="h-auto max-w-full"
          />
          <Accordion data={accordionDataV0_5_0} />
        </div>
      </TimelineItem>
    </div>
  );
}

export default v0_5_0;

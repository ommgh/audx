import Accordion from "@/components/changelog/badge-accordian";
import TimelineItem from "@/components/changelog/timeline";
import { accordionDataV0_5_0 } from "./changelog-data";

function v0_5_0() {
  return (
    <div className="w-full min-w-0">
      <TimelineItem date="May 16, 2026" version="v0.5.0">
        <div className="w-full min-w-0 space-y-4 break-words">
          <div className="space-y-3">
            <h3 className="text-xl font-semibold">
              A synthesis engine, not a sound pack
            </h3>
            <p className="text-muted-foreground text-sm">
              audx no longer ships audio files. Every sound is now a small
              object that the Web Audio API synthesizes when it plays, so sounds
              weigh a few hundred bytes and can be tweaked like any other code.
            </p>
          </div>
          <div className="space-y-3">
            <p className="font-medium">Now you can:</p>
            <ul className="text-muted-foreground list-inside list-disc space-y-3 text-sm">
              <li>Define a sound in a few lines and play it with one call</li>
              <li>
                Build richer sounds from layers, filters, LFOs and effects
              </li>
              <li>
                Respect a user&apos;s sound setting in React with{" "}
                <code className="font-mono">SoundProvider</code>
              </li>
              <li>Ask your coding agent to design new sounds for you</li>
            </ul>
          </div>
          <pre className="overflow-x-auto border bg-muted/40 px-4 py-3 font-mono text-xs">
            {`import { defineSound } from "@litlab/audx";

const pop = defineSound({
  source: { type: "sine", frequency: { start: 1200, end: 300 } },
  envelope: { attack: 0.001, decay: 0.06 },
  gain: 0.3,
});

pop();`}
          </pre>
          <img
            src="/c/c-agent-skill.png"
            alt="The create-sound agent skill, installed with npx skills add ommgh/audx"
            className="h-auto max-w-full"
          />
          <Accordion data={accordionDataV0_5_0} />
        </div>
      </TimelineItem>
    </div>
  );
}

export default v0_5_0;

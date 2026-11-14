import Accordion from "@/components/changelog/badge-accordian";
import TimelineItem from "@/components/changelog/timeline";
import { accordionDataV0_6_0 } from "./changelog-data";

function v0_6_0() {
  return (
    <div className="w-full min-w-0">
      <TimelineItem date="May 17, 2026" version="v0.6.0">
        <div className="w-full min-w-0 space-y-4 break-words">
          <div className="space-y-3">
            <h3 className="text-xl font-semibold">Themes and a mixing panel</h3>
            <p className="text-muted-foreground text-sm">
              Sound sets are now called themes everywhere, from the CLI to the
              site, and the editor gained a panel for auditioning sounds side
              by side.
            </p>
          </div>
          <div className="space-y-3">
            <ul className="text-muted-foreground list-inside list-disc space-y-3 text-sm">
              <li>Preview and balance sounds before installing them</li>
              <li>
                One name for sound sets across the CLI, the site and theme
                files
              </li>
            </ul>
          </div>
          <pre className="overflow-x-auto border bg-muted/40 px-4 py-3 font-mono text-xs">
            {`npx @litlab/audx add     # pick themes from the registry
npx @litlab/audx list    # see installed themes
npx @litlab/audx update  # pull theme updates`}
          </pre>
          <Accordion data={accordionDataV0_6_0} />
        </div>
      </TimelineItem>
    </div>
  );
}

export default v0_6_0;

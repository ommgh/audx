import TimelineItem from "@/components/changelog/timeline";
import Accordion from "@/components/changelog/badge-accordian";
import { accordionDataV1_3_0 } from "./changelog-data";

function v1_3_0() {
  return (
    <div className="w-full min-w-0">
      <TimelineItem date="November 7, 2025" version="v 1.3.0">
        <div className="w-full min-w-0 space-y-4 break-words">
          <div className="space-y-3">
            <h3 className="text-xl font-semibold">
              Component Sync Unified Library Management (Beta)
            </h3>
            <p className="text-muted-foreground text-sm">
              We’re launching Component Sync, a new way to manage, version, and
              update all your shadcn components across projects with a single
              click.
            </p>
          </div>
          <div className="space-y-3">
            <p className="font-medium">Now you can:</p>
            <ul className="text-muted-foreground list-inside list-disc space-y-3 text-sm">
              <li>Sync shared components instantly between multiple apps</li>
              <li>Track version diffs and apply updates selectively</li>
              <li>Automatically resolve dependency conflicts</li>
            </ul>
          </div>
          <img
            src="/images/image-1.webp"
            alt="Component Sync Demo"
            className="h-auto max-w-full"
          />
          <Accordion data={accordionDataV1_3_0} />
        </div>
      </TimelineItem>
    </div>
  );
}

export default v1_3_0;

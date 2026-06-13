import Link from "next/link";

import TimelineItem from "@/components/changelog/timeline";
import Accordion from "@/components/changelog/badge-accordian";
import { buttonVariants } from "@/components/ui/button";
import { accordionDataV0_8_5 } from "./changelog-data";

function v0_8_5() {
  return (
    <div className="w-full min-w-0">
      <TimelineItem date="June 10, 2024" version="v0.8.5">
        <div className="w-full min-w-0 space-y-4 break-words">
          <div className="space-y-3">
            <h3 className="text-xl font-semibold">
              Visual Audio Editor & Theme Generator
            </h3>
            <p className="text-muted-foreground text-sm">
              We've completely upgraded the customization capabilities of audx.
              Now you can use the visual audio-editor and theme-generator to
              personalize your sounds.
            </p>
          </div>
          <img
            src="/c/c-audio-editor.png"
            alt="Audio Editor & Theme Generator Demo"
            className="h-auto max-w-full"
          />
          <p className="text-muted-foreground">
            Version 0.8.0 introduces a brand new Audio Editor, enabling you to
            tailor sound profiles visually and intuitively. Alongside this, the
            Theme Generator gives you full control over how your audio
            visualizations look and feel, ensuring your workspace matches your
            unique style.
          </p>
          <p className="text-muted-foreground">
            We've also added a dedicated Library section for users to browse and
            manage their generated themes easily. Lastly, our CLI has been
            updated, allowing you to install custom created sounds directly to
            your projects without any hassle.
          </p>
          <Link className={buttonVariants()} href="#">
            Read More
          </Link>
          <Accordion data={accordionDataV0_8_5} />
        </div>
      </TimelineItem>
    </div>
  );
}

export default v0_8_5;

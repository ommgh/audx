import Link from "next/link";

import TimelineItem from "@/components/changelog/timeline";
import Accordion from "@/components/changelog/badge-accordian";
import { buttonVariants } from "@/components/ui/button";
import { accordionDataV1_1_0 } from "./changelog-data";

function v1_1_0() {
  return (
    <div className="w-full min-w-0">
      <TimelineItem date="January 15, 2025" version="v 1.1.0">
        <div className="w-full min-w-0 space-y-4 break-words">
          <div className="space-y-3">
            <h3 className="text-xl font-semibold">
              Design Tokens 2.0 Global Theme Rebuild
            </h3>
            <p className="text-muted-foreground text-sm">
              We&apos;ve completely redesigned the theme system for Design
              Tokens 2.0. Tokens are now hierarchical, semantic, and fully
              type-safe — built for scaling design systems.
            </p>
          </div>
          <img
            src="/images/image-2.webp"
            alt="Design Tokens 2.0 Demo"
            className="h-auto max-w-full"
          />
          <p className="text-muted-foreground">
            Design Tokens 2.0 introduces a complete overhaul of how themes are
            managed within shadcnstudio. With this update, design tokens are now
            hierarchical and semantic, offering greater flexibility and
            scalability for your design system.
          </p>
          <p className="text-muted-foreground">
            The new system supports automatic dark/light theme pairing, making
            it easier than ever to maintain consistent visuals across all
            environments. Tokens for colors, spacing, typography, and more are
            now fully type-safe and easily customizable, ensuring that your
            design system can grow alongside your projects.{" "}
          </p>
          <Link className={buttonVariants()} href="#">
            Read More
          </Link>
          <Accordion data={accordionDataV1_1_0} />
        </div>
      </TimelineItem>
    </div>
  );
}

export default v1_1_0;

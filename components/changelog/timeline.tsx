import type { ReactNode } from "react";

import V0_8_5 from "./data/v0_8_5";
import V0_6_0 from "./data/v0_6_0";
import V0_5_0 from "./data/v0_5_0";

type TimelineItemProps = {
  children: ReactNode;
  date: string;
  version: string;
};

function TimelineItem({ children, date, version }: TimelineItemProps) {
  return (
    <article className="relative w-full min-w-0 border-border border-l pb-10 pl-4 sm:pl-6 last:pb-0">
      <div className="absolute -left-1.5 top-1.5 z-10 h-3 w-3 rounded-full border border-primary bg-background" />
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="font-mono text-muted-foreground text-xs">{date}</span>
        <span className="rounded-full bg-primary/10 px-2.5 py-1 font-mono text-primary text-xs">
          {version}
        </span>
      </div>
      {children}
    </article>
  );
}

function TimelineSection() {
  return (
    <section>
      <div className="mx-auto w-full max-w-4xl min-w-0 px-4 py-10 md:px-8 md:py-16">
        <div className="flex w-full min-w-0 flex-col items-start">
          <V0_8_5 />
          <V0_6_0 />
          <V0_5_0 />
        </div>
      </div>
    </section>
  );
}

export { TimelineSection };
export default TimelineItem;

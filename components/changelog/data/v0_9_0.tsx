import Link from "next/link";

import Accordion from "@/components/changelog/badge-accordian";
import TimelineItem from "@/components/changelog/timeline";
import { buttonVariants } from "@/components/ui/button";
import { accordionDataV0_9_0 } from "./changelog-data";

function v0_9_0() {
	return (
		<div className="w-full min-w-0">
			<TimelineItem date="November 10, 2026" version="v0.9.0">
				<div className="w-full min-w-0 space-y-4 break-words">
					<div className="space-y-3">
						<h3 className="text-xl font-semibold">
							New sounds, new CLI, showcase
						</h3>
						<p className="text-muted-foreground text-sm">
							Every sound was redesigned from scratch so each one is distinct
							and each theme has its own personality. The CLI was rebuilt around
							a simple idea: sounds are code you own.
						</p>
					</div>
					<pre className="overflow-x-auto border bg-muted/40 px-4 py-3 font-mono text-xs">
						{`npx @litlab/audx init
npx @litlab/audx add click success error
npx @litlab/audx theme mechanical`}
					</pre>
					<p className="text-muted-foreground text-sm">
						Upgrading from 0.8: run{" "}
						<code className="font-mono">npx @litlab/audx init</code> and re-add
						the sounds you use. Files now live in{" "}
						<code className="font-mono">src/sounds/</code> and are imported as{" "}
						<code className="font-mono">{`import { click } from "@/sounds"`}</code>
						. The old <code className="font-mono">.themes/config.json</code> and
						generated theme folders can be deleted.
					</p>
					<Link className={buttonVariants()} href="/showcase">
						Open the showcase
					</Link>
					<Accordion data={accordionDataV0_9_0} />
				</div>
			</TimelineItem>
		</div>
	);
}

export default v0_9_0;

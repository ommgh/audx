"use client";

import { useState } from "react";
import {
  RiCheckLine,
  RiFileCopyLine,
  RiTerminalBoxLine,
  RiFlashlightLine,
} from "@remixicon/react";

import { cn } from "@/lib/utils";
import { DJMixer } from "@/components/editor/DJMixer";

function InstallCommand() {
  const [copied, setCopied] = useState(false);
  const cmd = "npx skills add ommgh/audx";

  const copy = async () => {
    await navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <RiFlashlightLine className="text-primary h-5 w-5" />
        <h2 className="text-lg font-semibold tracking-tight">Agent Skill</h2>
      </div>

      <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
        Add the{" "}
        <span className="text-foreground font-medium">create-sound</span> skill
        to your coding agent. It teaches your agent to generate a{" "}
        <code className="bg-muted rounded px-1 py-0.5 text-xs">
          SoundDefinition
        </code>{" "}
        for{" "}
        <code className="bg-muted rounded px-1 py-0.5 text-xs">
          @litlab/audx
        </code>{" "}
        from a natural-language prompt, an audio file, or both — covering event
        recipes, mood vocabulary, layering patterns, effect chains, and output
        validation.
      </p>

      <button
        onClick={copy}
        className={cn(
          "group flex items-center gap-3 rounded-lg border px-4 py-3 transition-all",
          "bg-muted/50 hover:bg-muted font-mono text-sm",
          "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
          copied && "border-primary/40 bg-primary/5",
        )}
      >
        <RiTerminalBoxLine className="text-muted-foreground h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">{cmd}</span>
        {copied ? (
          <RiCheckLine className="text-primary h-4 w-4 shrink-0" />
        ) : (
          <RiFileCopyLine className="text-muted-foreground h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
        )}
      </button>

      <p className="text-muted-foreground text-xs">
        Uses the{" "}
        <a
          href="https://github.com/vercel-labs/agent-skills"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          agent-skills
        </a>{" "}
        format — run{" "}
        <code className="bg-muted rounded px-1 py-0.5">/create-sound</code> to
        create new sounds and themes.
      </p>
    </div>
  );
}

const EditorPage = () => {
  return (
    <div className="border-border mx-auto min-h-dvh max-w-6xl border-x">
      <div className="space-y-10 px-6 py-8">
        <InstallCommand />

        <div className="border-border border-t pt-10 -mx-6 px-6">
          <DJMixer />
        </div>
      </div>
    </div>
  );
};

export default EditorPage;

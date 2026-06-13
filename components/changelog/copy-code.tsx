"use client";

import { RiCheckLine, RiFileCopyLine } from "@remixicon/react";
import { useState } from "react";

type CopyCodeProps = {
  code: string;
  language?: string;
};

const codeExample = `
  import { SoundProvider } from "@litlab/audx/react";
  function App() {
    const [enabled, setEnabled] = useState(true);
    const [volume, setVolume] = useState(0.8);
    return (
      <SoundProvider
        enabled={enabled}
        volume={volume}
        onEnabledChange={setEnabled}
        onVolumeChange={setVolume}
      >
        {children}
      </SoundProvider>
    );
  }`;

export default function CopyCodeBlock() {
  return (
    <div className="w-full min-w-0">
      <CopyCode code={codeExample} />
    </div>
  );
}

function CopyCode({ code = "typescript" }: CopyCodeProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      // Check if clipboard API is available
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } else {
        // Fallback method for older browsers or non-secure contexts
        const textArea = document.createElement("textarea");

        textArea.value = code;
        textArea.style.position = "absolute";
        textArea.style.left = "-999999px";
        document.body.prepend(textArea);
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    } catch (err) {
      console.error("Failed to copy", err);

      // Show user feedback even if copy failed
      alert("Failed to copy code to clipboard");
    }
  };

  // Simple syntax highlighting for JavaScript/TypeScript
  const highlightCode = (code: string) => {
    let result = code;

    // 0. Escape HTML special characters so React tags aren't treated as actual HTML
    result = result
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // 1. Strings (blue) - process first to protect content
    result = result.replace(
      /"([^"]*)"/g,
      '<span class="text-blue-600 dark:text-blue-400">"$1"</span>',
    );
    result = result.replace(
      /\b(agent)\b/g,
      '<span class="text-blue-600 dark:text-blue-400">$1</span>',
    );

    // 2. Keywords (red/green)
    result = result.replace(
      /\b(const|let|var|new|false|import|from|function|return)\b/g,
      '<span class="text-red-600 dark:text-red-400">$1</span>',
    );

    result = result.replace(
      /\b(AIAgent|true|SoundProvider|useState|App)\b/g,
      '<span class="text-green-600 dark:text-green-400">$1</span>',
    );

    // 3. Comments (gray) - process last
    result = result.replace(
      /\/\/ ([^\n]*)/g,
      '<span class="text-gray-500 dark:text-gray-400">// $1</span>',
    );

    return result;
  };

  return (
    <div
      className="bg-muted relative w-full min-w-0 overflow-hidden rounded-[14px] p-2.5"
      style={{ fontFamily: "'Fira Code', monospace" }}
    >
      <div className="min-w-0 rounded-[10px] bg-white px-2.5 py-3.5 text-xs dark:bg-black">
        <pre className="max-w-full overflow-x-auto">
          <code dangerouslySetInnerHTML={{ __html: highlightCode(code) }} />
        </pre>
        <button
          onClick={handleCopy}
          className="bg-muted absolute end-0 bottom-0 rounded-md p-2 transition-colors"
          aria-label={copied ? "Copied" : "Copy code"}
        >
          {copied ? (
            <RiCheckLine className="size-4" />
          ) : (
            <RiFileCopyLine className="size-4" />
          )}
        </button>
      </div>
    </div>
  );
}

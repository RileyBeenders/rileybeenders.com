"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";

/** How long the copy button shows its confirmation before resetting. */
const COPIED_MS = 1800;

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), COPIED_MS);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      // Clipboard access can be refused (insecure origin, permissions); the code stays selectable.
    }
  }

  return (
    <div className="pj-code">
      <pre className="pj-code-pre"><code>{code}</code></pre>
      <button
        type="button"
        className="pj-code-copy"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy command"}
        title={copied ? "Copied" : "Copy"}
      >
        {copied ? <Check size={15} strokeWidth={1.8} aria-hidden="true" /> : <Copy size={15} strokeWidth={1.8} aria-hidden="true" />}
      </button>
      <span className="sr-only" aria-live="polite">{copied ? "Copied to clipboard" : ""}</span>
    </div>
  );
}

/**
 * A project's status line. Anything fenced in ``` renders as a copyable code
 * block, so an install command can live in projects.json as plain text.
 */
export function ProjectStatus({ text }: { text: string }) {
  const parts = text.split("```");

  return (
    <div className="pj-status">
      {parts.map((part, i) => {
        const trimmed = part.trim();
        if (!trimmed) return null;
        return i % 2 === 1
          ? <CodeBlock key={i} code={trimmed} />
          : <p key={i}>{trimmed}</p>;
      })}
    </div>
  );
}

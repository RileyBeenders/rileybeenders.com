"use client";

import { useState } from "react";
import type { ResumeData } from "@/types/resume";

type BpActionsProps = {
  data: ResumeData;
};

function ArrowDown() {
  return (
    <svg className="bp-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 2v11m0 0l-4.5-4.5M8 13l4.5-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg className="bp-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2.5 8h11m0 0L9 3.5M13.5 8L9 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BpActions({ data }: BpActionsProps) {
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const busy = state === "loading";

  async function handleDownload() {
    if (busy) return;
    setState("loading");

    try {
      const { downloadPublishedResumePdf } = await import("@/ResumeBuilder/downloadPublishedResume");
      await downloadPublishedResumePdf(data.resumePdfPath);
      setState("idle");
    } catch (error) {
      console.error("Unable to download the published resume PDF.", error);
      setState("error");
    }
  }

  return (
    <div className="bp-actions">
      <button
        type="button"
        className="bp-btn bp-btn--solid"
        onClick={handleDownload}
        disabled={busy}
        aria-busy={busy}
      >
        {!busy && <span className="bp-sheen" aria-hidden="true" />}
        <span>{busy ? "Preparing PDF…" : "Download PDF"}</span>
        {!busy && <ArrowDown />}
      </button>

      <a className="bp-btn" href={`mailto:${data.person.email}`} suppressHydrationWarning>
        <span>Email</span>
        <ArrowRight />
      </a>

      <a className="bp-btn" href={data.person.linkedin} target="_blank" rel="noreferrer" suppressHydrationWarning>
        <span>LinkedIn</span>
        <ArrowRight />
      </a>

      <a className="bp-btn" href={data.person.github} target="_blank" rel="noreferrer" suppressHydrationWarning>
        <span>GitHub</span>
        <ArrowRight />
      </a>

      {state === "error" && (
        <span className="bp-error" role="alert">
          The PDF could not be created. Please try again.
        </span>
      )}
    </div>
  );
}

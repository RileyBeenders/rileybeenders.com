"use client";

import { useState } from "react";
import { Download, Mail } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/sheet/BrandIcons";
import type { ResumeData } from "@/types/resume";
import { ui } from "@/lib/copy";

type HeroActionsProps = {
  person: ResumeData["person"];
  resumePdfPath: string;
  resumeHtmlPath?: string;
};

/**
 * The row under the hero: Download PDF (the interactive HTML resume when one
 * is published, else the PDF file), then email, LinkedIn and GitHub.
 */
export function HeroActions({ person, resumePdfPath, resumeHtmlPath }: HeroActionsProps) {
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const busy = state === "loading";

  async function handleDownload() {
    if (busy) return;
    setState("loading");
    try {
      const { downloadPublishedResumePdf } = await import("@/ResumeBuilder/downloadPublishedResume");
      await downloadPublishedResumePdf(resumePdfPath);
      setState("idle");
    } catch (error) {
      console.error("Unable to download the published resume PDF.", error);
      setState("error");
    }
  }

  return (
    <div className="hero-actions">
      {resumeHtmlPath ? (
        <a className="btn btn--solid" href={resumeHtmlPath} target="_blank" rel="noopener" suppressHydrationWarning>
          <span className="bp-sheen" aria-hidden="true" />
          <Download size={16} strokeWidth={2} aria-hidden="true" />
          <span>{ui.actions.downloadPdf}</span>
        </a>
      ) : (
        <button type="button" className="btn btn--solid" onClick={handleDownload} disabled={busy} aria-busy={busy}>
          {!busy && <span className="bp-sheen" aria-hidden="true" />}
          <Download size={16} strokeWidth={2} aria-hidden="true" />
          <span>{busy ? ui.actions.preparingPdf : ui.actions.downloadPdf}</span>
        </button>
      )}

      <a className="btn" href={`mailto:${person.email}`} suppressHydrationWarning>
        <Mail size={16} strokeWidth={1.9} aria-hidden="true" />
        <span>{ui.actions.email}</span>
      </a>
      <a className="btn" href={person.linkedin} target="_blank" rel="noreferrer" suppressHydrationWarning>
        <LinkedinIcon size={15} />
        <span>{ui.actions.linkedin}</span>
      </a>
      <a className="btn" href={person.github} target="_blank" rel="noreferrer" suppressHydrationWarning>
        <GithubIcon size={15} />
        <span>{ui.actions.github}</span>
      </a>

      {state === "error" && (
        <span className="hero-error" role="alert">The PDF could not be created. Please try again.</span>
      )}
    </div>
  );
}

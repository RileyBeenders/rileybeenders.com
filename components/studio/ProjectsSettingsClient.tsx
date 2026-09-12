"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SaveBar } from "@/components/studio/SaveBar";
import type { StudioSettings } from "@/types/studio";

export function ProjectsSettingsClient({ initialSettings }: { initialSettings: StudioSettings }) {
  const [settings, setSettings] = useState<StudioSettings>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const router = useRouter();

  function toggleWip() {
    setSettings((current) => ({
      ...current,
      projects: { ...current.projects, showWipAnimation: !current.projects.showWipAnimation }
    }));
  }

  async function handleSave() {
    setSaving(true);
    setError(false);
    setMessage(null);
    try {
      const response = await fetch("/api/studio-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      if (!response.ok) throw new Error("Request failed");
      const saved: StudioSettings = await response.json();
      setSettings(saved);
      setMessage("Saved — live on the site now.");
      router.refresh();
    } catch {
      setError(true);
      setMessage("Couldn't save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  const showWip = settings.projects.showWipAnimation;

  return (
    <>
      <div className="studio-page-head">
        <p className="studio-eyebrow">Studio</p>
        <h1>Projects</h1>
        <p>
          Controls for the public{" "}
          <Link href="/projects" target="_blank" rel="noopener noreferrer">
            /projects
          </Link>{" "}
          page.
        </p>
      </div>

      <div className="studio-panel">
        <h2>Work-in-progress animation</h2>
        <p className="studio-panel-desc">
          The Projects page can show the animated &ldquo;case studies in progress&rdquo; loader, or a
          real project grid built from the same project data used on the resume.
        </p>
        <div className="studio-toggle-row">
          <div className="studio-toggle-copy">
            <h3>Show WIP animation</h3>
            <p>
              On: visitors see the coming-soon loader. Off: visitors see a grid with each
              project&apos;s name, type, and summary.
            </p>
          </div>
          <button type="button" role="switch" aria-checked={showWip} className="studio-switch" onClick={toggleWip}>
            <span className="studio-switch-thumb" aria-hidden="true" />
          </button>
        </div>
      </div>

      <SaveBar saving={saving} message={message} error={error} onSave={handleSave} />
    </>
  );
}

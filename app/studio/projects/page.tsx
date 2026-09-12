import type { Metadata } from "next";
import { readStudioSettings } from "@/lib/studio-settings";
import { ProjectsSettingsClient } from "@/components/studio/ProjectsSettingsClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Projects | Studio" };

export default function StudioProjectsPage() {
  const settings = readStudioSettings();
  return <ProjectsSettingsClient initialSettings={settings} />;
}

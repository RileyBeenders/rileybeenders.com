import type { Metadata } from "next";
import { readStudioSettings } from "@/lib/studio-settings";
import { SiteSettingsClient } from "@/components/studio/SiteSettingsClient";
// Needed so the .bp classes used by the live preview render with real site styles.
import "@/app/(site)/blueprint.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Site Settings | Studio" };

export default function SiteSettingsPage() {
  const settings = readStudioSettings();
  return <SiteSettingsClient initialSettings={settings} />;
}

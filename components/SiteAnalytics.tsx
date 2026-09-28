"use client";

import { useEffect } from "react";
import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";
import { track } from "@vercel/analytics";

// Set in a browser to keep its visits out of Web Analytics. Toggle it with
// ?analytics=off / ?analytics=on on any page, or from the console with
// localStorage.setItem("va-disable", "true").
const OPT_OUT_KEY = "va-disable";
// Marks that this tab session already sent its Visit event.
const VISIT_KEY = "va-visit-sent";

function isOptedOut() {
  try {
    return localStorage.getItem(OPT_OUT_KEY) !== null;
  } catch {
    return false;
  }
}

function applyOptOutParam() {
  try {
    const value = new URLSearchParams(window.location.search).get("analytics");
    if (value === "off") localStorage.setItem(OPT_OUT_KEY, "true");
    else if (value === "on") localStorage.removeItem(OPT_OUT_KEY);
  } catch {}
}

// Runs on every pageview and custom event before it leaves the browser.
function beforeSend(event: BeforeSendEvent) {
  return isOptedOut() ? null : event;
}

type Geo = { country: string | null; region: string | null; city: string | null };

/**
 * Vercel Web Analytics plus one "Visit" custom event per tab session carrying
 * the visitor's state/region and city, which pageviews alone don't record.
 * Pro allows two properties per custom event: region ("US-PA") and city.
 */
export default function SiteAnalytics() {
  useEffect(() => {
    applyOptOutParam();
    if (isOptedOut()) return;
    try {
      if (sessionStorage.getItem(VISIT_KEY)) return;
      sessionStorage.setItem(VISIT_KEY, "1");
    } catch {}

    fetch("/api/geo", { cache: "no-store" })
      .then((res) => (res.ok ? (res.json() as Promise<Geo>) : null))
      .then((geo) => {
        if (!geo?.country) return; // local dev, or Vercel couldn't place the IP
        // track() silently drops events until <Analytics> has set up window.va,
        // and this lookup usually finishes first. Queue it the way Vercel's HTML
        // snippet does; the script replays window.vaq when it loads.
        window.va ??= (event, properties) => {
          (window.vaq ??= []).push([event, properties]);
        };
        track("Visit", {
          region: geo.region ? `${geo.country}-${geo.region}` : geo.country,
          city: geo.city ?? "Unknown"
        });
      })
      .catch(() => {});
  }, []);

  return <Analytics beforeSend={beforeSend} />;
}

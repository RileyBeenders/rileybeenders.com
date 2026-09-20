import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";

// Next blocks Fast Refresh and other /_next requests whose Origin isn't the
// host the dev server was started on. When a phone opens the site through the
// device gate (`npm run site`), its Origin is this machine's LAN address, so
// every private-network range is allowed here — which devices actually get
// in is decided per device by the gate (studio/gate.mjs), not by this list.
// The matcher takes one wildcard per dotted segment.
const PRIVATE_NETWORK_HOSTS = [
  "10.*.*.*",
  "192.168.*.*",
  ...Array.from({ length: 16 }, (_, i) => `172.${16 + i}.*.*`),
  "100.*.*.*", // carrier-grade NAT, which mesh VPNs also hand out
  "169.254.*.*",
  "*.local" // mDNS names such as rileys-pc.local
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The projects page puts its back-to-top control in the bottom-left corner,
  // which is where the dev overlay sits by default.
  devIndicators: { position: "bottom-right" },

  // rileybeenders.com/AutoWinUpdater is the short link for the AutoWinUpdater
  // install script, which lives on GitHub. Sources match case-insensitively
  // (experimental.caseSensitiveRoutes is off), so /autowinupdater works too.
  // Temporary (307) so the target can be repointed without fighting caches.
  async redirects() {
    return [
      {
        source: "/AutoWinUpdater",
        destination:
          "https://raw.githubusercontent.com/RileyBeenders/RB-s-Auto-App-Updater/main/install.ps1",
        permanent: false
      }
    ];
  }
};

export default function config(phase) {
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    return { ...nextConfig, allowedDevOrigins: PRIVATE_NETWORK_HOSTS };
  }
  return nextConfig;
}

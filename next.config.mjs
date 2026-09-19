// LAN hosts allowed to hit the dev server (phone/tablet testing) are machine-
// specific, so they come from the git-ignored .env.local rather than this file:
//   ALLOWED_DEV_ORIGINS=10.0.0.5,10.0.0.6
// Next loads .env.local before evaluating this config.
const allowedDevOrigins = (process.env.ALLOWED_DEV_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  ...(allowedDevOrigins.length > 0 && { allowedDevOrigins }),
  // The projects page puts its back-to-top control in the bottom-left corner,
  // which is where the dev overlay sits by default.
  devIndicators: { position: "bottom-right" }
};

export default nextConfig;

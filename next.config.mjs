/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["10.5.0.2", "10.1.1.184"],
  // The projects page puts its back-to-top control in the bottom-left corner,
  // which is where the dev overlay sits by default.
  devIndicators: { position: "bottom-right" }
};

export default nextConfig;

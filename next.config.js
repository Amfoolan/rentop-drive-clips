/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ["fluent-ffmpeg", "ffmpeg-static"]
  }
};
module.exports = nextConfig;
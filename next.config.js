/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['fluent-ffmpeg'],
  },
  // Note: API body size limits are configured per-route via export const config
  // The top-level 'api' key is not valid in Next.js 14 App Router
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enables Docker optimization by creating a self-contained server
  output: 'standalone',
  
  experimental: {
    // Prevents Webpack from bundling native binaries, allowing FFmpeg to execute
    serverComponentsExternalPackages: ['fluent-ffmpeg'],
  },
};

module.exports = nextConfig;

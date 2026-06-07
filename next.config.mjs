/** @type {import('next').NextConfig} */
const nextConfig = {
  // Erlaubt Standalone-Build für schlanke Docker-Images
  output: "standalone",
  experimental: {
    // Server Actions sind in Next 15 stabil; Body-Limit für Uploads anheben
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;

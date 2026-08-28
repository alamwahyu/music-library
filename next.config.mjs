/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = {
  basePath,
  async rewrites() {
    return [
      {
        source: "/uploads/music/:path*",
        destination: "/api/uploads/music/:path*"
      }
    ];
  }
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'xhvikeyigduvayrbvura.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  turbopack: {},
};

export default nextConfig;

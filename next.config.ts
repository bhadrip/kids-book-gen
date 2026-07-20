import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  distDir: process.env.KIDS_BOOK_NEXT_DIST_DIR ?? ".next",
};

export default nextConfig;

import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Pin the workspace root so Next doesn't accidentally pick up a parent
  // lockfile during build trace collection.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;

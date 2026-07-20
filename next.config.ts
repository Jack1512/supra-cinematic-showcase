import type { NextConfig } from "next";

const repoName = "supra-cinematic-showcase";
const isGitHubActions = process.env.GITHUB_ACTIONS === "true";
const basePath = isGitHubActions ? `/${repoName}` : "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,

  images: {
    unoptimized: true,
  },

  basePath,
  assetPrefix: basePath,
};

export default nextConfig;

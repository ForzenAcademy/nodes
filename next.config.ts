import type { NextConfig } from "next";

const isStaticRelease = process.env.FACTORINODE_STATIC_RELEASE === "1";
const releaseBasePath = process.env.FACTORINODE_RELEASE_BASE_PATH ?? "/node";

const nextConfig: NextConfig = isStaticRelease
  ? {
      output: "export",
      assetPrefix: releaseBasePath,
      trailingSlash: true,
    }
  : {};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  agentRules: false,
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-mariadb", "mariadb"],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

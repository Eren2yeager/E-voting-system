import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Load remote images from any http(s) host (URL pasted by admins/users, not a single CDN)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

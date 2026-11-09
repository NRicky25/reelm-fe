import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Artwork comes from Supabase Storage (public bucket). Only that path is
    // allowed, so next/image can't be used to proxy arbitrary sites.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;

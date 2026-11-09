import type { NextConfig } from "next";
type RemotePatterns = NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]>;

// Artwork comes from our own Supabase project's public `images` bucket.
// Only that exact host + bucket is allowed, so nobody can use our image
// optimizer to serve pictures from their own Supabase project.
const supabaseUrl = process.env.IMAGES_SUPABASE_URL;

const remotePatterns: RemotePatterns = supabaseUrl
  ? [
      {
        protocol: "https",
        hostname: new URL(supabaseUrl).hostname,
        pathname: "/storage/v1/object/public/images/**",
      },
    ]
  : [];

const nextConfig: NextConfig = {
  images: { remotePatterns },
};

export default nextConfig;

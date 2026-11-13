import type { NextConfig } from "next";
type RemotePatterns = NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]>;

// Artwork comes from our own media server (the self-hosted media folder behind
// the Cloudflare Tunnel), e.g. https://media.reelm.site/images/posters/x.jpg.
// Only that exact host + the images/ folder is allowed, so nobody can use our
// image optimizer to serve pictures from somewhere else.
const mediaUrl = process.env.IMAGES_MEDIA_URL;

const remotePatterns: RemotePatterns = mediaUrl
  ? [
      {
        protocol: "https",
        hostname: new URL(mediaUrl).hostname,
        pathname: "/images/**",
      },
    ]
  : [];

const nextConfig: NextConfig = {
  images: { remotePatterns },
};

export default nextConfig;

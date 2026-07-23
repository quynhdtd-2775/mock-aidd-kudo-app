import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Google account avatars (OAuth profile pictures on kudo cards).
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      // Local Supabase Storage (kudos-images bucket thumbnails).
      { protocol: "http", hostname: "127.0.0.1", port: "54321", pathname: "/storage/v1/object/public/**" },
    ],
  },
};

export default withNextIntl(nextConfig);

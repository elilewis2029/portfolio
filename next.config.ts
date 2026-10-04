import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Serve bucket images through Supabase's image transformer (see lib/image-loader.ts).
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
  },
  serverExternalPackages: ["sharp"],
};

export default nextConfig;

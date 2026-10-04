import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Serve bucket images through Supabase's image transformer (see lib/image-loader.ts).
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
  },
  serverExternalPackages: ["sharp"],
  // The intake system prompt is read from disk at runtime; the intake action can run from any page (the "+" sheet).
  outputFileTracingIncludes: { "/**": ["./prompts/**/*"] },
};

export default nextConfig;

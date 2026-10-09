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
  // The project pages moved from /work to /projects (so "Work" is not confused with work experience); old links keep working.
  async redirects() {
    return [
      { source: "/work", destination: "/projects", permanent: true },
      { source: "/work/:path*", destination: "/projects/:path*", permanent: true },
    ];
  },
};

export default nextConfig;

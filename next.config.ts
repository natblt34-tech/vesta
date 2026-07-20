import type { NextConfig } from "next";

/* Export statique : le site n'a aucune dépendance serveur.
   NEXT_PUBLIC_BASE_PATH=/vesta est défini par le workflow GitHub Pages. */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  /* Export statique : next/image sans optimisation serveur. */
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

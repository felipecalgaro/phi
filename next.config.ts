import createMDX from "@next/mdx";
import { env } from "./lib/env";

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  images: {
    remotePatterns: [
      new URL(`https://${env.CLOUDFRONT_DOMAIN}/video-thumbnails/**`),
    ],
  },
};

const withMDX = createMDX();

export default withMDX(nextConfig);

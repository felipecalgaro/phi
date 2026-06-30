import { SITE_ORIGIN, absoluteUrl } from '@/lib/seo';
import type { MetadataRoute } from 'next';

const disallowedPaths = [
  "/api/",
  "/admin/",
  "/roadmap",
  "/login",
  "/unsubscribe",
  "/acing-aufnahmetest/lessons",
  "/acing-aufnahmetest/community",
  "/acing-aufnahmetest/purchase",
];

const crawlerRules = [
  "*",
  "OAI-SearchBot",
  "GPTBot",
  "ChatGPT-User",
].map((userAgent) => ({
  userAgent,
  allow: "/",
  disallow: disallowedPaths,
}));

export default function robots(): MetadataRoute.Robots {
  return {
    rules: crawlerRules,
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_ORIGIN,
  };
}

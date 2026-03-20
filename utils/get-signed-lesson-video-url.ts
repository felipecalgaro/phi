import "server-only";

import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
import { env } from "../lib/env";

const DEFAULT_SIGNED_URL_TTL_SECONDS = 600;

export type SignedLessonVideoUrl = {
  url: string;
  expiresAt: number;
};

export function getSignedLessonVideoUrl(slug: string): SignedLessonVideoUrl {
  const signedUrlTTLSeconds =
    env.CLOUDFRONT_SIGNED_URL_TTL_SECONDS || DEFAULT_SIGNED_URL_TTL_SECONDS;
  const expiresAt = Date.now() + signedUrlTTLSeconds * 1000;
  const videoUrl = `https://${env.CLOUDFRONT_DOMAIN}/videos/${slug}.mp4`;

  const url = getSignedUrl({
    url: videoUrl,
    keyPairId: env.CLOUDFRONT_PUBLIC_KEY,
    privateKey: env.CLOUDFRONT_PRIVATE_KEY,
    dateLessThan: new Date(expiresAt).toISOString(),
  });

  return {
    url,
    expiresAt,
  };
}

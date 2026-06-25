import "server-only";

import { env } from "@/lib/env";
import { createToken } from "@/lib/jwt";
import { redis } from "@/lib/redis";

export const MAGIC_LINK_MARKER_TTL_SECONDS = 60 * 15;

export type MagicLinkRedirect = "purchase" | "roadmap" | null;

type CreateMagicLinkOptions = {
  email: string;
  redirectTo: MagicLinkRedirect;
};

export async function createMagicLink({
  email,
  redirectTo,
}: CreateMagicLinkOptions) {
  const jti = crypto.randomUUID();

  const temporaryToken = await createToken(
    {
      email,
      redirectTo,
      jti,
    },
    "15min",
  );

  await redis.set(`magic_link:${jti}`, "pending", {
    ex: MAGIC_LINK_MARKER_TTL_SECONDS,
  });

  return {
    jti,
    magicLink: `${env.NEXT_PUBLIC_URL}/api/auth?token=${temporaryToken}`,
  };
}

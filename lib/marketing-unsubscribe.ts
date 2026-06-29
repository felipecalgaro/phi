import "server-only";

import { env } from "@/lib/env";
import { createToken, verifyToken } from "@/lib/jwt";
import z from "zod";

const MARKETING_UNSUBSCRIBE_PURPOSE = "marketing_unsubscribe";

const marketingUnsubscribeTokenSchema = z.object({
  purpose: z.literal(MARKETING_UNSUBSCRIBE_PURPOSE),
  userId: z.uuid(),
  email: z.email(),
  iat: z.number(),
  exp: z.number(),
});

type MarketingUnsubscribeOptions = {
  userId: string;
  email: string;
};

export async function createMarketingUnsubscribeUrl({
  userId,
  email,
}: MarketingUnsubscribeOptions) {
  const token = await createToken(
    {
      purpose: MARKETING_UNSUBSCRIBE_PURPOSE,
      userId,
      email: email.trim().toLowerCase(),
    },
    "3650d",
  );

  const unsubscribeUrl = new URL("/unsubscribe", env.NEXT_PUBLIC_URL);
  unsubscribeUrl.searchParams.set("token", token);

  return unsubscribeUrl.toString();
}

export async function verifyMarketingUnsubscribeToken(token: string) {
  const { payload } = await verifyToken(token);
  const tokenData = marketingUnsubscribeTokenSchema.parse(payload);

  return {
    userId: tokenData.userId,
    email: tokenData.email.trim().toLowerCase(),
  };
}

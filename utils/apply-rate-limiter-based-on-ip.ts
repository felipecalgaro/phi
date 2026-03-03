import { rateLimiter } from "@/lib/rate-limiters";
import { getUserIp } from "./get-user-ip";
import "server-only";

export async function applyRateLimiterBasedOnIP() {
  const ip = await getUserIp();

  if (!ip) throw new Error("IP address not found");

  const { success } = await rateLimiter.limit(ip);

  return { success };
}

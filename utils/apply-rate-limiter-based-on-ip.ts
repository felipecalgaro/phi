import { rateLimiter } from "@/lib/rate-limiters";
import { getUserIp } from "./get-user-ip";
import "server-only";

export async function applyRateLimiterBasedOnIP() {
  const ip = await getUserIp();

  const { success } = await rateLimiter.limit(ip ? `ip:${ip}` : "ip:unknown");

  return { success };
}

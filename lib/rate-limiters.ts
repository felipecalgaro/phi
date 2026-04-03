import { redis } from "./redis";
import { Ratelimit } from "@upstash/ratelimit";

export const emailRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(5, "1 h"),
  analytics: true,
});

export const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
  timeout: 1000,
});

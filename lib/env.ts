import { z } from "zod";

const envSchema = z.object({
  JWT_SECRET: z.string(),
  RESEND_API_KEY: z.string(),
  NEXT_PUBLIC_URL: z.string(),
  NEXT_PUBLIC_GA_TRACKING_ID: z.string(),
  DATABASE_URL: z.string(),
  EMAIL_SENDER: z.email(),
  STRIPE_PRICE_ID: z.string(),
  STRIPE_SECRET_KEY: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),
  CLOUDFRONT_DOMAIN: z.string(),
  CLOUDFRONT_PUBLIC_KEY: z.string(),
  CLOUDFRONT_PRIVATE_KEY: z.string(),
});

export const env = envSchema.parse(process.env);

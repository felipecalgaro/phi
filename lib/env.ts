import { z } from "zod";

const envSchema = z.object({
  JWT_SECRET: z.string(),
  RESEND_API_KEY: z.string(),
  NEXT_PUBLIC_URL: z.string(),
  NEXT_PUBLIC_GA_TRACKING_ID: z.string(),
  DATABASE_URL: z.string(),
  EMAIL_SENDER: z.email(),
});

export const env = envSchema.parse(process.env);

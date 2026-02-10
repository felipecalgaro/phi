import "server-only";
import { jwtVerify, SignJWT } from "jose";
import { env } from "./env";
import z from "zod";
import { Role } from "@/generated/prisma/enums";

const secretKey = new TextEncoder().encode(env.JWT_SECRET);

export const tokenPayloadSchema = z.object({
  userId: z.uuid(),
  userRole: z.enum(Role),
  iat: z.number(),
  exp: z.number(),
});

export async function createToken(
  payload: Record<string, unknown>,
  expiration?: string,
) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiration || "30d")
    .sign(secretKey);
}

export async function verifyToken(token: string) {
  return await jwtVerify(token, secretKey, {
    algorithms: ["HS256"],
  });
}

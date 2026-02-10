import "server-only";
import { createToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { Role } from "@/generated/prisma/enums";

type CreateCookiesSessionProps = {
  userId: string;
  userRole: Role;
};

export async function createCookiesSession({
  userId,
  userRole,
}: CreateCookiesSessionProps) {
  const session = await createToken({
    userId,
    userRole,
  });

  const cookiesStore = await cookies();

  cookiesStore.set("token", session, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30, // 30 days,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
}

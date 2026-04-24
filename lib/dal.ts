import { Role } from "@/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { createCookiesSession } from "@/utils/create-cookies-session";
import { cookies } from "next/headers";
import { cache } from "react";
import { tokenPayloadSchema, verifyToken } from "./jwt";

type VerifySessionResult = Promise<
  | {
      isAuthenticated: true;
      userId: string;
      userRole: Role;
    }
  | {
      isAuthenticated: false;
      userId: null;
      userRole: null;
    }
>;

export const verifySession = cache<() => VerifySessionResult>(async () => {
  const token = (await cookies()).get("token")?.value;

  if (!token) {
    return {
      isAuthenticated: false,
      userId: null,
      userRole: null,
    };
  }

  try {
    const session = await verifyToken(token);

    const payload = tokenPayloadSchema.parse(session.payload);

    if (payload.userRole !== Role.BASIC) {
      return {
        isAuthenticated: true,
        userId: payload.userId,
        userRole: payload.userRole,
      };
    }

    const user = await prisma.user.findUnique({
      where: {
        id: payload.userId,
      },
      select: {
        role: true,
      },
    });

    if (user && user.role !== Role.BASIC) {
      await createCookiesSession({
        userId: payload.userId,
        userRole: user.role,
      });

      return {
        isAuthenticated: true,
        userId: payload.userId,
        userRole: user.role,
      };
    }

    return {
      isAuthenticated: true,
      userId: payload.userId,
      userRole: payload.userRole,
    };
  } catch {
    return {
      isAuthenticated: false,
      userId: null,
      userRole: null,
    };
  }
});

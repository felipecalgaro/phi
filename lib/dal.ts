import { Role } from "@/generated/prisma/enums";
import { cookies } from "next/headers";
import { cache } from "react";
import { tokenPayloadSchema, verifyToken } from "./jwt";
import { redirect } from "next/navigation";

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

    return {
      isAuthenticated: true,
      userId: payload.userId,
      userRole: payload.userRole,
    };
  } catch {
    redirect("/acing-aufnahmetest/login");
  }
});

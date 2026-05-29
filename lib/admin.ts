import { Role } from "@/generated/prisma/enums";
import { verifySession } from "@/lib/dal";
import prisma from "@/lib/prisma";

export async function verifyAdminAccess() {
  const session = await verifySession();

  if (!session.isAuthenticated) {
    return {
      ok: false as const,
      code: "unauthorized" as const,
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.userId,
    },
    select: {
      role: true,
    },
  });

  if (!user || user.role !== Role.ADMIN) {
    return {
      ok: false as const,
      code: "forbidden" as const,
    };
  }

  return {
    ok: true as const,
    userId: session.userId,
    role: user.role,
  };
}

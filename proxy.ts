import { NextRequest, NextResponse } from "next/server";
import { tokenPayloadSchema, verifyToken } from "./lib/jwt";

export async function proxy(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const path = req.nextUrl.pathname;

  if (token && path === "/acing-aufnahmetest/login") {
    try {
      await verifyToken(token);
      return NextResponse.redirect(
        new URL("/acing-aufnahmetest/lessons", req.url),
      );
    } catch {
      const res = NextResponse.next();

      res.cookies.delete("token");
      return res;
    }
  } else if (!token && path.startsWith("/acing-aufnahmetest/lessons")) {
    return NextResponse.redirect(new URL("/acing-aufnahmetest/login", req.url));
  } else if (token && path.startsWith("/acing-aufnahmetest/lessons")) {
    try {
      const { payload } = await verifyToken(token);

      const { userRole } = tokenPayloadSchema.parse(payload);

      if (userRole === "BASIC") {
        return NextResponse.redirect(
          new URL("/acing-aufnahmetest/purchase", req.url),
        );
      }

      return NextResponse.next();
    } catch {
      const res = NextResponse.redirect(
        new URL("/acing-aufnahmetest/login", req.url),
      );

      res.cookies.delete("token");
      return res;
    }
  } else if (!token && path === "/acing-aufnahmetest/purchase") {
    if (!token) {
      const res = NextResponse.redirect(
        new URL("/acing-aufnahmetest/login", req.url),
      );

      res.cookies.set("redirect_to_purchase", "true");
      return res;
    }
  } else if (token && path === "/acing-aufnahmetest/purchase") {
    try {
      const { payload } = await verifyToken(token);

      const { userRole } = tokenPayloadSchema.parse(payload);

      if (userRole !== "BASIC") {
        return NextResponse.redirect(
          new URL("/acing-aufnahmetest/lessons", req.url),
        );
      }

      return NextResponse.next();
    } catch {
      const res = NextResponse.redirect(
        new URL("/acing-aufnahmetest/login", req.url),
      );

      res.cookies.delete("token");
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|images|favicon.ico).*)"],
};

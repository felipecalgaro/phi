import { NextRequest, NextResponse } from "next/server";
import { setRequestId } from "@/lib/sentry-context";
import { tokenPayloadSchema, verifyToken } from "./lib/jwt";

function getRequestId(request: NextRequest) {
  return request.headers.get("x-request-id") ?? crypto.randomUUID();
}

function nextWithRequestId(request: NextRequest, requestId: string) {
  const headers = new Headers(request.headers);
  headers.set("x-request-id", requestId);

  const response = NextResponse.next({
    request: {
      headers,
    },
  });

  response.headers.set("x-request-id", requestId);

  return response;
}

function withRequestId(response: NextResponse, requestId: string) {
  response.headers.set("x-request-id", requestId);

  return response;
}

export async function proxy(req: NextRequest) {
  const requestId = getRequestId(req);
  setRequestId(requestId);

  const token = req.cookies.get("token")?.value;
  const path = req.nextUrl.pathname;

  if (token && path === "/acing-aufnahmetest/login") {
    try {
      const { payload } = await verifyToken(token);

      const { userRole } = tokenPayloadSchema.parse(payload);

      if (userRole === "BASIC") {
        return withRequestId(
          NextResponse.redirect(new URL("/acing-aufnahmetest", req.url)),
          requestId,
        );
      }

      return withRequestId(
        NextResponse.redirect(new URL("/acing-aufnahmetest/lessons", req.url)),
        requestId,
      );
    } catch {
      const res = nextWithRequestId(req, requestId);

      res.cookies.delete("token");
      return res;
    }
  } else if (!token && path.startsWith("/acing-aufnahmetest/lessons")) {
    return withRequestId(
      NextResponse.redirect(new URL("/acing-aufnahmetest/login", req.url)),
      requestId,
    );
  } else if (token && path.startsWith("/acing-aufnahmetest/lessons")) {
    try {
      const { payload } = await verifyToken(token);

      const { userRole } = tokenPayloadSchema.parse(payload);

      if (userRole === "BASIC") {
        return withRequestId(
          NextResponse.redirect(
            new URL("/acing-aufnahmetest/purchase", req.url),
          ),
          requestId,
        );
      }

      return nextWithRequestId(req, requestId);
    } catch {
      const res = withRequestId(
        NextResponse.redirect(new URL("/acing-aufnahmetest/login", req.url)),
        requestId,
      );

      res.cookies.delete("token");
      return res;
    }
  } else if (!token && path === "/acing-aufnahmetest/purchase") {
    const res = withRequestId(
      NextResponse.redirect(new URL("/acing-aufnahmetest/login", req.url)),
      requestId,
    );

    res.cookies.set("redirect_to_purchase", "true");
    return res;
  } else if (token && path === "/acing-aufnahmetest/purchase") {
    try {
      const { payload } = await verifyToken(token);

      const { userRole } = tokenPayloadSchema.parse(payload);

      if (userRole !== "BASIC") {
        return withRequestId(
          NextResponse.redirect(
            new URL("/acing-aufnahmetest/lessons", req.url),
          ),
          requestId,
        );
      }

      return nextWithRequestId(req, requestId);
    } catch {
      const res = withRequestId(
        NextResponse.redirect(new URL("/acing-aufnahmetest/login", req.url)),
        requestId,
      );

      res.cookies.delete("token");
      return res;
    }
  }

  return nextWithRequestId(req, requestId);
}

export const config = {
  matcher: [
    "/api/:path*",
    "/((?!api|_next/static|_next/image|images|favicon.ico).*)",
  ],
};

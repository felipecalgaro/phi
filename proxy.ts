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

const ADMIN_ROUTES = ["/admin"];

const PREMIUM_ROUTES = ["/acing-aufnahmetest/lessons", "/community"];

const AUTH_ROUTES = ["/roadmap"];

const BASIC_ONLY_ROUTES = ["/acing-aufnahmetest/purchase"];

const UNAUTH_ONLY_ROUTES = ["/acing-aufnahmetest/login"];

export async function proxy(req: NextRequest) {
  const requestId = getRequestId(req);
  setRequestId(requestId);

  const token = req.cookies.get("token")?.value;
  const path = req.nextUrl.pathname;

  if (ADMIN_ROUTES.some((route) => path.startsWith(route))) {
    if (!token) {
      return withRequestId(
        NextResponse.redirect(new URL("/acing-aufnahmetest/login", req.url)),
        requestId,
      );
    }

    try {
      const { payload } = await verifyToken(token);

      const { userRole } = tokenPayloadSchema.parse(payload);

      if (userRole !== "ADMIN") {
        return withRequestId(
          NextResponse.redirect(new URL("/acing-aufnahmetest", req.url)),
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

  if (token && UNAUTH_ONLY_ROUTES.some((route) => path.startsWith(route))) {
    try {
      await verifyToken(token);

      return withRequestId(
        NextResponse.redirect(new URL("/", req.url)),
        requestId,
      );
    } catch {
      const res = nextWithRequestId(req, requestId);

      res.cookies.delete("token");
      return res;
    }
  } else if (!token && PREMIUM_ROUTES.some((route) => path.startsWith(route))) {
    return withRequestId(
      NextResponse.redirect(new URL("/acing-aufnahmetest/login", req.url)),
      requestId,
    );
  } else if (!token && AUTH_ROUTES.some((route) => path.startsWith(route))) {
    const redirectTo = path.startsWith("/roadmap") ? "roadmap" : undefined;

    const res = withRequestId(
      NextResponse.redirect(
        new URL(
          `/acing-aufnahmetest/login${redirectTo ? `?redirect=${redirectTo}` : ""}`,
          req.url,
        ),
      ),
      requestId,
    );
    return res;
  } else if (
    !token &&
    BASIC_ONLY_ROUTES.some((route) => path.startsWith(route))
  ) {
    const redirectTo = path.startsWith("/acing-aufnahmetest/purchase")
      ? "purchase"
      : undefined;

    const res = withRequestId(
      NextResponse.redirect(
        new URL(
          `/acing-aufnahmetest/login${redirectTo ? `?redirect=${redirectTo}` : ""}`,
          req.url,
        ),
      ),
      requestId,
    );
    return res;
  } else if (
    token &&
    BASIC_ONLY_ROUTES.some((route) => path.startsWith(route))
  ) {
    try {
      const { payload } = await verifyToken(token);

      const { userRole } = tokenPayloadSchema.parse(payload);

      if (userRole !== "BASIC") {
        return withRequestId(
          NextResponse.redirect(new URL("/", req.url)),
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

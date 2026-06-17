# API Route Convention

Use this convention when creating or updating API routes in `app/api`.

Normal application API routes should use request validation, Sentry context, rate limiting, auth checks when needed, and typed JSON responses by default. If a route intentionally skips one of these, the reason should be explicit in the implementation or in the task request.

## Response Shape

Application API routes should return `NextResponse.json()` typed with `ResponseDataObject` or `ResponseDataObject<TData>` from `@/utils/get-response-data-object`.

```ts
return NextResponse.json<ResponseDataObject>(
  {
    success: false,
    error: "Too many requests, please try again later.",
  },
  { status: 429 },
);
```

`ResponseDataObject` is the standard API response type:

```ts
type ResponseDataObject<T = unknown> =
  | {
      success: true;
      data?: T;
    }
  | {
      success: false;
      error: string;
    };
```

Use `ResponseDataObject<TData>` when returning a successful payload that callers should consume with a concrete type:

```ts
type UserStatusData = {
  hasAccess: boolean;
};

return NextResponse.json<ResponseDataObject<UserStatusData>>({
  success: true,
  data: {
    hasAccess: true,
  },
});
```

Error responses should include an HTTP status:

```ts
return NextResponse.json<ResponseDataObject>(
  {
    success: false,
    error: "Unauthorized",
  },
  { status: 403 },
);
```

## Common Status Codes

- `200`: successful JSON response.
- `400`: invalid query parameters, invalid request body, invalid token, or malformed input.
- `401`: unauthenticated request.
- `402`: payment required or payment not completed.
- `403`: authenticated but not authorized.
- `422`: semantically invalid provider data or metadata.
- `429`: rate limited.
- `502`: upstream/provider failure.

## Request Validation

Use `zod` schemas for request bodies, query parameters, provider metadata, and token payloads.

For query parameters:

```ts
const result = queryParamsSchema.safeParse(
  request.nextUrl.searchParams.get("token"),
);

if (!result.success) {
  Sentry.setTag("error_type", "invalid_token");
  Sentry.captureMessage("token_invalid", { level: "warning" });

  return NextResponse.json<ResponseDataObject>(
    {
      success: false,
      error: "Invalid query parameters",
    },
    { status: 400 },
  );
}
```

For JSON request bodies:

```ts
let body: z.infer<typeof requestSchema>;

try {
  body = requestSchema.parse(await request.json());
} catch (error) {
  captureCriticalPathError({
    error,
    path: "route_name",
    requestId,
  });

  return NextResponse.json<ResponseDataObject>(
    {
      success: false,
      error: "Invalid request body",
    },
    { status: 400 },
  );
}
```

Do not read unvalidated fields from request bodies, query params, token payloads, or provider metadata.

## Sentry

API routes should set Sentry context unless explicitly instructed otherwise.

Use the existing helpers from `@/lib/sentry-context`:

- `setRequestId(requestId)` at the start of the route.
- `setUserId(userId)` after a user has been identified.
- `setRateLimitContext("user", userId)` for authenticated user-based limits.
- `setRateLimitContext("email", email)` for email-based limits.
- `setRateLimitContext("ip")` when the route is anonymous or no stronger key is available.
- `setStripeEventId(stripeEventId)` for Stripe webhook or fulfillment flows.

Prefer this request id pattern:

```ts
const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
setRequestId(requestId);
```

For expected rate limit failures:

```ts
Sentry.setTag("error_type", "rate_limit");
Sentry.captureMessage("route_name_rate_limited", { level: "warning" });
```

For provider, database, webhook, token, or other critical-path failures, use `captureCriticalPathError` from `@/lib/sentry-errors`:

```ts
captureCriticalPathError({
  error,
  path: "route_name",
  requestId,
  tags: {
    error_type: "provider_error",
  },
});
```

Do not send secrets, tokens, signed URLs, raw request bodies, cookies, webhook signatures, or payment data to Sentry.

## Rate Limiting

API routes should apply rate limiting unless explicitly instructed otherwise.

Use `applyRateLimiter` from `@/utils/apply-rate-limiter`:

```ts
const { success } = await applyRateLimiter({
  failureMode: "fail-closed",
  userId,
});
```

Use the strongest available key:

- Authenticated route: pass `userId`.
- Email-based anonymous route: pass `email`.
- Anonymous route with no stable identity: omit both so the limiter uses IP.

For sensitive mutations, auth flows, checkout, fulfillment, paid-content access, and token-consuming routes, prefer `failureMode: "fail-closed"`.

For low-risk read routes, `failureMode: "fail-open"` may be acceptable.

If rate limiting fails, return:

```ts
return NextResponse.json<ResponseDataObject>(
  {
    success: false,
    error: "Too many requests, please try again later.",
  },
  { status: 429 },
);
```

## Auth Checks

If the API route is auth protected, call `verifySession` from `@/lib/dal`.

```ts
const { isAuthenticated, userId, userRole } = await verifySession();

if (!isAuthenticated) {
  Sentry.setTag("error_type", "unauthenticated");

  return NextResponse.json<ResponseDataObject>(
    {
      success: false,
      error: "Unauthenticated",
    },
    { status: 401 },
  );
}
```

After authentication succeeds, set Sentry user context and use `userId` for rate limiting:

```ts
setUserId(userId);
setRateLimitContext("user", userId);
```

For role-based access checks:

```ts
if (userRole === "BASIC") {
  Sentry.setTag("error_type", "forbidden");

  return NextResponse.json<ResponseDataObject>(
    {
      success: false,
      error: "Unauthorized",
    },
    { status: 403 },
  );
}
```

## Default Template

```ts
import * as Sentry from "@sentry/nextjs";
import { verifySession } from "@/lib/dal";
import { captureCriticalPathError } from "@/lib/sentry-errors";
import {
  setRateLimitContext,
  setRequestId,
  setUserId,
} from "@/lib/sentry-context";
import { applyRateLimiter } from "@/utils/apply-rate-limiter";
import { ResponseDataObject } from "@/utils/get-response-data-object";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  // Define fields here.
});

export async function POST(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  setRequestId(requestId);

  const { isAuthenticated, userId } = await verifySession();

  if (!isAuthenticated) {
    Sentry.setTag("error_type", "unauthenticated");

    return NextResponse.json<ResponseDataObject>(
      {
        success: false,
        error: "Unauthenticated",
      },
      { status: 401 },
    );
  }

  setUserId(userId);
  setRateLimitContext("user", userId);

  const { success: rateLimitSuccess } = await applyRateLimiter({
    failureMode: "fail-closed",
    userId,
  });

  if (!rateLimitSuccess) {
    Sentry.setTag("error_type", "rate_limit");
    Sentry.captureMessage("route_name_rate_limited", { level: "warning" });

    return NextResponse.json<ResponseDataObject>(
      {
        success: false,
        error: "Too many requests, please try again later.",
      },
      { status: 429 },
    );
  }

  let body: z.infer<typeof requestSchema>;

  try {
    body = requestSchema.parse(await request.json());
  } catch (error) {
    captureCriticalPathError({
      error,
      path: "route_name",
      requestId,
    });

    return NextResponse.json<ResponseDataObject>(
      {
        success: false,
        error: "Invalid request body",
      },
      { status: 400 },
    );
  }

  try {
    // Perform the route work after auth, rate limiting, and validation.
    void body;

    return NextResponse.json<ResponseDataObject>({
      success: true,
      data: null,
    });
  } catch (error) {
    captureCriticalPathError({
      error,
      path: "route_name",
      requestId,
    });

    return NextResponse.json<ResponseDataObject>(
      {
        success: false,
        error: "Error processing request",
      },
      { status: 500 },
    );
  }
}
```

## Exceptions

Stripe webhooks may return bare `Response` objects instead of `NextResponse.json<ResponseDataObject>` when Stripe retry semantics require an empty response body and a specific status code.

Redirect-based routes, such as magic-link consumption, may return `NextResponse.redirect(...)` after successful processing. Failure branches should still use typed `NextResponse.json<ResponseDataObject>` responses with status codes.

## Implementation Rules

- Import `ResponseDataObject` from `@/utils/get-response-data-object`.
- Return typed JSON with `NextResponse.json<ResponseDataObject>` or `NextResponse.json<ResponseDataObject<TData>>` for normal application API responses.
- Include an HTTP status in every error response.
- Set Sentry request context at the start of the route.
- Apply rate limiting unless explicitly instructed otherwise.
- Use `verifySession` for auth-protected routes.
- Validate request input before using it.
- Keep provider metadata and token payload validation explicit.
- Do not expose stack traces, raw validation details, secrets, tokens, signed URLs, cookies, webhook signatures, or payment data.
- Use existing project helpers for auth, sessions, rate limiting, Sentry, Stripe, Redis, Prisma, and fulfillment logic.

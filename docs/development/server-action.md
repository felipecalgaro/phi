# Server Action Convention

Use this convention when creating or updating server actions in this project.

Server actions should use request validation, Sentry context, and rate limiting by default. If a server action intentionally skips one of these, the reason should be explicit in the implementation or in the task request.

## Function Shape

Every server action should receive a single `unknown` request parameter:

```ts
import { ResponseDataObject } from "@/utils/get-response-data-object";

export async function actionName(
  request: unknown,
): Promise<ResponseDataObject> {
  // ...
}
```

The `request` parameter must be treated as untrusted input. Do not access properties directly from `request` before validation.

If an action truly does not need caller-provided input, still prefer accepting `request: unknown` and validating an empty object schema unless there is a clear reason to keep a different API.

## Request Validation

Define a `requestSchema` before the server action function. Parse the incoming request with `safeParse`.

If parsing fails, always return:

```ts
return {
  success: false,
  error: "Invalid request data. Please try again.",
};
```

## Return Type

When not redirecting, server actions should always return `Promise<ResponseDataObject>` or `Promise<ResponseDataObject<TData>>`, importing `ResponseDataObject` from `@/utils/get-response-data-object`.

```ts
import { ResponseDataObject } from "@/utils/get-response-data-object";

type ResponseDataObject<T = unknown> =
  | {
      success: false;
      error: string;
    }
  | {
      success: true;
      data?: T;
    };
```

Use `{ success: true }` for successful operations with no meaningful payload.

Use `ResponseDataObject<TData>` and `{ success: true, data }` when the caller needs a typed successful result payload.

```ts
type SaveProfileData = {
  displayName: string;
};

export async function saveProfile(
  request: unknown,
): Promise<ResponseDataObject<SaveProfileData>> {
  return {
    success: true,
    data: {
      displayName: "Ada",
    },
  };
}
```

Use `{ success: false, error: "..." }` for expected failures that should be shown to the user or handled by the caller.

## Sentry

Every server action should set Sentry context unless explicitly instructed otherwise.

Use the existing helpers from `@/lib/sentry-context`:

- `setRequestId(requestId)` at the start of the action.
- `setUserId(userId)` after a user has been identified.
- `setRateLimitContext("user", userId)` for authenticated user-based limits.
- `setRateLimitContext("email", email)` for email-based limits.
- `setRateLimitContext("ip")` when the action is anonymous or no stronger key is available.

For expected rate limit failures, tag and capture a warning:

```ts
Sentry.setTag("error_type", "rate_limit");
Sentry.captureMessage("action_name_rate_limited", { level: "warning" });
```

For provider, database, or other critical-path failures, use `captureCriticalPathError` from `@/lib/sentry-errors`:

```ts
captureCriticalPathError({
  error,
  path: "action_name",
  requestId,
  tags: {
    error_type: "provider_error",
  },
});
```

Do not send secrets, tokens, signed URLs, raw request bodies, cookies, or payment data to Sentry.

## Rate Limiting

Every server action should apply a rate limiter unless explicitly instructed otherwise.

Use `applyRateLimiter` from `@/utils/apply-rate-limiter` for the standard application limiter:

```ts
const { success: rateLimitSuccess } = await applyRateLimiter({
  failureMode: "fail-closed",
  userId,
});
```

Use the strongest available key:

- Authenticated action: pass `userId`.
- Email-based anonymous action: pass `email`.
- Anonymous action with no stable identity: omit both so the limiter uses IP.

For sensitive mutations, auth flows, checkout, email sends, and paid-content access, prefer `failureMode: "fail-closed"`.

If rate limiting fails, return:

```ts
return {
  success: false,
  error: "Too many requests, please try again later.",
};
```

Some flows may need specialized rate limiters, such as the magic-link action using both email and IP checks. Keep those checks local to the action when the behavior is specific to that action.

## Auth-Protected Actions

If the server action is auth protected, it must call `verifySession` from `@/lib/dal`.

```ts
const { isAuthenticated, userId } = await verifySession();

if (!isAuthenticated) {
  return {
    success: false,
    error: "Unauthorized. Please log in and try again.",
  };
}
```

After authentication succeeds, set Sentry user context and use the user id for rate limiting:

```ts
setUserId(userId);
setRateLimitContext("user", userId);
```

## Template

```ts
"use server";

import * as Sentry from "@sentry/nextjs";
import { z } from "zod";
import { verifySession } from "@/lib/dal";
import { captureCriticalPathError } from "@/lib/sentry-errors";
import {
  setRateLimitContext,
  setRequestId,
  setUserId,
} from "@/lib/sentry-context";
import { applyRateLimiter } from "@/utils/apply-rate-limiter";
import { ResponseDataObject } from "@/utils/get-response-data-object";

const requestSchema = z.object({
  // Define fields here.
});

export async function actionName(
  request: unknown,
): Promise<ResponseDataObject> {
  const requestId = crypto.randomUUID();
  setRequestId(requestId);

  const parsedRequest = requestSchema.safeParse(request);

  if (!parsedRequest.success) {
    Sentry.setTag("error_type", "invalid_payload");

    return {
      success: false,
      error: "Invalid request data. Please try again.",
    };
  }

  const data = parsedRequest.data;

  const { isAuthenticated, userId } = await verifySession();

  if (!isAuthenticated) {
    Sentry.setTag("error_type", "forbidden");

    return {
      success: false,
      error: "Unauthorized. Please log in and try again.",
    };
  }

  setUserId(userId);
  setRateLimitContext("user", userId);

  const { success: rateLimitSuccess } = await applyRateLimiter({
    failureMode: "fail-closed",
    userId,
  });

  if (!rateLimitSuccess) {
    Sentry.setTag("error_type", "rate_limit");
    Sentry.captureMessage("action_name_rate_limited", {
      level: "warning",
    });

    return {
      success: false,
      error: "Too many requests, please try again later.",
    };
  }

  try {
    // Perform the action after validation, auth, and rate limiting.
    void data;
  } catch (error) {
    captureCriticalPathError({
      error,
      path: "action_name",
      requestId,
    });

    return {
      success: false,
      error: "Error processing request. Please try again later.",
    };
  }

  return {
    success: true,
  };
}
```

## Implementation Rules

- Keep `"use server";` at the top of the file.
- Import `ResponseDataObject` from `@/utils/get-response-data-object` and return `Promise<ResponseDataObject>` or `Promise<ResponseDataObject<TData>>` when the success branch includes typed `data`.
- Validate the request before reading from it.
- Keep the schema close to the action unless it is shared by multiple files.
- Prefer explicit, user-safe error messages.
- Do not return stack traces, raw validation errors, tokens, secrets, signed URLs, or internal identifiers unless the caller explicitly needs them.
- Set Sentry request context at the start of the action.
- Apply rate limiting in every server action unless explicitly instructed otherwise.
- For auth-protected actions, call `verifySession`, return an unauthorized failure when unauthenticated, and use the authenticated `userId` for Sentry and rate limiting.
- Perform authentication and authorization checks before side effects.
- Keep side effects after all validation and permission checks.
- Use existing project helpers for sessions, auth, database access, email, Stripe, and other integrations.
- Do not throw for expected user-facing failures. Return `{ success: false, error: "..." }` instead.
- Redirecting from a server action is an exception to the default return convention. Use it only when the caller does not need a structured result.

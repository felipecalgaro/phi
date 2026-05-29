# Feature: Admin Broadcast Email Page

## Overview

Add an admin-only broadcast email page at `/admin/broadcast` that lets an authenticated admin choose a recipient role (`BASIC` or `PREMIUM`), enter a subject, and provide an HTML body. Submission happens through a server action that uses the existing Resend integration and loads recipients from PostgreSQL with Prisma.

## Goals

- Add an admin-only page at `/admin/broadcast` with a simple broadcast form.
- Allow the admin to target either `BASIC` or `PREMIUM` users.
- Send the email from a server action, not from the client.
- Load recipient emails from the database with Prisma.
- Reuse the existing Resend setup and app environment variables.
- Keep the first version simple, secure, and low-cost for low traffic.

## Technical Decisions

### Architecture

Use a server-rendered admin page backed by a single server action:

- The proxy handles a quick JWT-based guard for all `/admin` routes.
- The page at `app/admin/broadcast/page.tsx` renders the form only; it does not perform its own admin check.
- A client form component handles local form state, submit progress, and result display.
- The server action performs the authoritative authorization check, validates input, queries Prisma for recipient emails, and sends the mail via Resend.
- No new API route is needed because the server action already gives a direct, server-only mutation path.

Recipient lookup should be database-driven and minimal:

- Query only the `email` field from `prisma.user`.
- Filter recipients by the selected role.
- Deduplicate addresses before sending.
- Keep the sender identity and subject/body handling inside the server action so the client never sees email provider details.

### Technologies and Libraries

- **Next.js App Router and Server Actions**: Simplest native fit for an admin submission flow with server-side validation and mutation.
- **Prisma**: Required for loading recipients from the database and keeping the query type-safe.
- **Existing Resend client (`lib/resend.ts`)**: Reuse the current email provider integration instead of adding a second delivery path.
- **Zod**: Use the existing schema validation approach for input validation at the server boundary.
- **Existing auth/session helpers (`lib/dal.ts`, `lib/jwt.ts`)**: Reuse the current session model and role data instead of introducing a separate admin auth system.

### Project Changes or Additions

- **`app/admin/broadcast/page.tsx`**: New admin-only page that renders the broadcast form and redirects or blocks non-admin users before the form is shown.
- **`proxy.ts`**: Add a quick JWT-based guard for `/admin` routes so non-admin users are redirected before the page renders.
- **`app/admin/broadcast/page.tsx`**: Render the broadcast form without a page-level admin check.
- **`components/admin/broadcast-email-form.tsx`**: New client component for the recipient role selector, subject input, HTML body textarea, submit state, and result messaging.
- **`actions/admin/send-broadcast-email.ts`**: New server action that validates input, checks admin authorization, fetches recipient emails from Prisma, sends one email per recipient through Resend, and returns a structured result.
- **`lib/admin.ts`**: Optional shared helper for admin role verification if the page and action would otherwise duplicate the same authorization logic.
- **`app/admin/layout.tsx`**: Optional route layout if a shared admin guard is preferred for the whole `/admin` subtree; use it only if it keeps the implementation smaller than duplicating page-level checks.

### Server Action Contract

Define the server action as the only write path for broadcasts.

**Action name**: `sendBroadcastEmail`

**Input shape**:

```ts
{
  recipientRole: "BASIC" | "PREMIUM";
  subject: string;
  htmlBody: string;
}
```

**Validation rules**:

- `recipientRole` must be exactly `BASIC` or `PREMIUM`.
- `subject` must be a non-empty trimmed string and should be bounded to a reasonable length, such as 1 to 120 characters.
- `htmlBody` must be a non-empty trimmed string and should be bounded to a practical maximum length for a broadcast email body, such as 1 to 50,000 characters.
- Reject unknown keys or malformed payloads.
- Normalize whitespace before send-time checks, but preserve the HTML markup content itself.

**Auth assumptions**:

- The action requires an authenticated session.
- The action must verify the current user is `ADMIN` using the existing session/JWT and Prisma-backed role source, not client state.
- If the session is missing, invalid, or the user is not an admin, the action must stop before any database recipient lookup or email send.

**Recipient selection logic**:

- Query `prisma.user.findMany` with `select: { email: true }` and `where: { role: recipientRole }`.
- Only send to users whose stored role matches the requested target role.
- Deduplicate emails before sending to avoid duplicate deliveries if the database contains repeated records across future migrations or imports.
- If the query returns zero recipients, fail fast instead of calling Resend.
- Send the HTML body as the email content exactly as provided after validation; do not transform it into markdown or plain text for this first version.
- Use the existing provider sender identity and domain config already used by the app.

**Send strategy**:

- Send one email per recipient to preserve recipient privacy and avoid exposing the full audience in a shared `to` or `cc` list.
- Keep the implementation synchronous from the admin perspective, since traffic is low and the recipient counts are expected to remain small.
- If provider limits become relevant later, batch size can be added without changing the page contract.

**Return shape**:

Success:

```ts
{
  success: true;
  recipientCount: number;
  sentCount: number;
}
```

Failure:

```ts
{
  success: false;
  error: string;
  code:
    | "invalid_payload"
    | "unauthorized"
    | "forbidden"
    | "no_recipients"
    | "provider_error"
    | "unexpected_error";
}
```

**Failure states**:

- `invalid_payload`: validation fails.
- `unauthorized`: no valid session exists.
- `forbidden`: session exists but the user is not an admin.
- `no_recipients`: the selected role has no matching users.
- `provider_error`: Resend fails for one or more sends.
- `unexpected_error`: any other server-side exception that is not safely classifiable.

The page should surface these failures in a user-friendly way without exposing internal stack traces or provider details.

## Security Considerations

- Enforce admin authorization on the server action, not only in the UI.
- Use a lightweight JWT-based proxy guard for `/admin` routes to avoid rendering admin pages for non-admin users.
- Validate all inputs with Zod before any database query or email send.
- Use Prisma field selection to fetch only recipient emails, not full user records.
- Avoid logging raw HTML bodies, tokens, or recipient lists to console or error tracking.
- Keep the broadcast page outside public navigation and require authenticated access before rendering the form.
- Use the existing Resend API key and app domain config from server-only code.
- Preserve recipient privacy by sending individual messages rather than exposing a shared mailing list.
- Keep the feature low-cost by avoiding extra queues, background jobs, or third-party mail list tooling for this low-volume admin workflow.

## File Checklist

### New Files

- `app/admin/broadcast/page.tsx`
- `components/admin/broadcast-email-form.tsx`
- `actions/admin/send-broadcast-email.ts`
- `lib/admin.ts` if a shared admin guard helper is introduced
- `app/admin/layout.tsx` if a shared admin route guard is preferred

### Modified Files

- `proxy.ts` to add the `/admin` JWT role gate
- `app/admin/broadcast/page.tsx` to remove the page-level admin check
- `lib/dal.ts` if the existing session helper needs a small extension for admin-only checks
- `lib/jwt.ts` only if the current session payload needs to be reused by the new admin guard helper
- `lib/resend.ts` only if a broadcast-specific sender helper is extracted for reuse
- `prisma/schema.prisma` only if a schema-level role or admin-related field adjustment is required, which is not expected for the first version

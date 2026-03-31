# Feature: Stripe Webhook Idempotency and Error Semantics Hardening

## Overview

Implement event-id based deduplication and controlled failure semantics for Stripe webhook processing to prevent duplicate charge entitlements and email sends, while ensuring deterministic outcomes and proper retry handling.

## Goals

- Prevent duplicate side effects from Stripe webhook replay or retry scenarios
- Return appropriate status codes based on failure type and retry strategy
- Ensure idempotent processing of all side effects (role grants, emails, cookies)
- Add structured logging for observability and debugging of webhook events
- Report deterministic outcomes per event-id in logs

## Technical Decisions

### Architecture

The webhook handler will follow this flow:

1. **Pre-processing idempotency check**: Before any processing, check Redis for `stripe:webhook:{event.id}`
2. **Deduplication decision**:
   - If key exists → return 200 immediately (already processed)
   - If not exists → proceed to processing
3. **Processing with atomic commitment**: Execute all side effects (role update, email, cookies)
4. **Post-processing storage**: On success, store key `stripe:webhook:{event.id}` with 7-day TTL
5. **Error handling with retry strategy**:
   - **Retryable errors** (e.g., timeout, rate limit): Log and return 500 (Stripe will retry)
   - **Non-retryable errors** (e.g., invalid checkout, user not found): Log, store completion marker, return 200 (move to manual review queue)
   - **Processing errors** during idempotent update: Return non-2xx to trigger retry
6. **Logging**: All paths log event context (id, type, result, user-id if available, error details)

### Technologies and Libraries

- **Redis (Upstash)**: Leverage existing `lib/redis.ts` client for idempotency key storage with TTL
  - Why: Simple, fast, already in the stack; 7-day TTL is well-suited to Stripe's retry window
- **Prisma**: Continue using for atomic user role updates
  - Why: Provides transactional guarantees; idempotency already partially enforced via role check
- **Next.js Response headers and status codes**: Properly signal webhook processing state to Stripe
  - Why: Native, no dependencies; follows Stripe webhook best practices
- **Console logging** (with structured format): Maintain current logging approach but enhance with event context
  - Why: Vercel logs are sufficient for audit and debugging on free tier

### Project Changes or Additions

- **`lib/webhook-utils.ts` (New)**: Utility functions for:
  - Checking and setting idempotency keys
  - Classifying errors (retryable vs non-retryable)
  - Structured logging output
- **`lib/fulfillment.ts` (New, or refactor existing)**: Pure fulfillment logic function that:
  - Accepts checkout session and event context (id, type)
  - Returns result with outcomes (role granted, email sent, error)
  - Contains no cookie mutations (separates concerns per Finding 5)

- **`app/api/webhooks/stripe/route.ts` (Modified)**: Enhanced POST handler:
  - Check idempotency key before processing
  - Extract fulfillment logic to new `lib/fulfillment.ts`
  - Add error classification and retry decision logic
  - Add structured logging with event id/type/result
  - Return appropriate status codes (200 for processed/non-retryable, 500 for retryable)
  - If webhook succeeds and user role changed, optionally trigger cookie refresh (or user refreshes on next page load)

- **`app/api/webhooks/stripe/route.ts` (Modified, GET endpoint)**:
  - Can continue calling `createCookiesSession` in the GET return path (browser authentication flow)
  - Or optionally create a separate "refresh session" endpoint that GET calls after webhook success

- **Prisma schema (No changes needed)**: User model already has role field

## Security Considerations

- **Event signature verification**: Already in place via `stripe.webhooks.constructEvent` - no changes needed
- **Idempotency key isolation**: Redis keys scoped to `stripe:webhook:*` namespace; cannot conflict with other uses
- **User validation**: `processStripeCheckout` already validates metadata.userId and payment status
- **Input validation**: Stripe event structure validated by SDK; metadata validated via Zod schema; no new user inputs
- **Sensitive data in logs**: Event and error logs will include event id/type and error messages but NO sensitive user data (no emails, no payment details)
- **TTL management**: 7-day TTL aligns with Stripe's ~3-day retry window, with buffer for investigation
- **Retry strategy**: By returning 500 for retryable errors and 200 for non-retryable, we ensure:
  - Stripe continues retrying if a transient failure occurs
  - Stripe stops retrying if a permanent issue (missing user, invalid checkout) occurs
  - No duplicate attempts for already-processed events (via idempotency key)

## File Checklist

### New Files

- `lib/webhook-utils.ts` - Idempotency key management, error classification, structured logging helpers
- `lib/fulfillment.ts` - Pure checkout fulfillment logic (role grant, email sending, side effects)

### Modified Files

- `app/api/webhooks/stripe/route.ts` - Add idempotency check, error handling, and logging
- `lib/redis.ts` - (No code changes; documented as dependency)

### Optional Refactoring

- Extract `createCookiesSession` call from webhook POST into a separate authenticated endpoint or client-side refresh after success (to address Finding 5)
- Add a debug logging utility for consistent structured format across the app

## Implementation Details

### Idempotency Check Flow

```
POST /api/webhooks/stripe
  ↓
Parse and verify Stripe signature (existing)
  ↓
Extract event.id and event.type
  ↓
Check Redis key: stripe:webhook:{event.id}
  ├─ Key exists → Return 200 (already processed)
  └─ Key missing → Continue to processing
  ↓
Begin processing (fulfillment)
  ├─ Role update: prisma.user.update (idempotent)
  ├─ Email send: resend.emails.send (store result)
  └─ Cookies: createCookiesSession (idempotent/overwrite)
  ↓
Outcome evaluation
  ├─ Success → Set Redis key, return 200
  ├─ Retryable error → Log with context, return 500
  └─ Non-retryable error → Log with context, set Redis key (blocked), return 200
  ↓
Response sent
```

### Error Classification

**Retryable (return 500):**

- Database constraint violations (transient)
- Timeout retrieving checkout session from Stripe
- Redis connection issues (rare)
- Email service temporarily unavailable

**Non-retryable (return 200 + log):**

- User not found (invalid metadata.userId)
- Checkout session not found or malformed
- Payment status not "paid" (data validation fail)
- Invalid metadata (Zod parse fail)
- Webhook event signature invalid (already caught earlier, but for completeness)

### Logging Format

Include in all error/success logs:

```
{
  eventId: string,
  eventType: string,
  uid: string | "unknown",
  action: "success" | "skipped" | "error_retryable" | "error_non_retryable",
  reason?: string,
  error?: string,
  timestamp: ISO8601
}
```

### Idempotency Key Storage

**Key pattern**: `stripe:webhook:{event.id}`
**Value**: A marker (e.g., `"processed"`) or metadata object with timestamp
**TTL**: 7 days (604800 seconds)
**Rationale**:

- Event IDs are globally unique per Stripe account
- 7 days covers Stripe's max retry window (~3 days) plus one investigation window
- Prevents legitimate replays from old events from causing duplicate grants

## Testing Approach

### Manual Testing (Pre-deployment)

1. **Test idempotency**:
   - Trigger checkout success
   - Replay same event-id manually via curl or Postman
   - Verify second request returns 200 and no role/user changes
   - Check Redis key exists and has TTL

2. **Test error handling**:
   - Simulate transient error (mock db timeout) → verify returns 500
   - Simulate non-retryable error (mock user not found) → verify returns 200 and error is logged
   - Verify logs include event-id and error context

3. **Test idempotent side effects**:
   - Process same event twice
   - Verify role granted once, email sent once (check Resend dashboard), cookies overwritten (same token)
   - Verify no duplicate database records

### Automated Testing (Post-implementation)

- Unit test helpers in `lib/webhook-utils.ts` (idempotency key generation, error classification)
- Integration test for POST handler with mocked Stripe event and Redis
- E2E test: publish test event → verify role update → replay event → verify no additional change

## Notes and Assumptions

- **Event-id uniqueness**: Stripe guarantees unique event-ids per Stripe account; no collision risk
- **Redis availability**: Low traffic (≤200 users/month) means statistically low concurrent webhook processing; Upstash free tier is sufficient
- **Email idempotency**: Currently email is NOT sent via webhook (only in GET handler); if future requirement adds email to webhook, use Resend idempotency keys as secondary safeguard
- **Database transaction**: Consider wrapping role update and email send in a Prisma transaction if both occur in same path
- **Monitoring**: Logs with event-id can be searched in Vercel/cloud provider logs for audit and debugging
- **Future enhancement**: Implement dead-letter queue (e.g., Supabase table) to track non-retryable errors for manual investigation

## Done When Criteria

- ✅ Replaying the same event-id produces no duplicate entitlements (role update idempotent)
- ✅ Webhook logs show deterministic outcomes per event-id (same id always → success or always → same error)
- ✅ Webhook returns 200 for already-processed events (idempotency key cached)
- ✅ Webhook returns 500 only for retryable errors; Stripe retries as configured
- ✅ Webhook returns 200 for non-retryable errors; Stripe stops retrying
- ✅ Event processing context (id, type, result) visible in logs
- ✅ No duplicate emails sent on replay (audit via Resend dashboard)

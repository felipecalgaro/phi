# Feature: Sentry Observability Integration for Critical Paths

## Overview

Add Sentry error tracking, performance monitoring, and structured logging to Phi application to detect auth, payment, and video delivery incidents in real-time. Instrument critical paths with contextual data (requestId, userId, stripeEventId, lessonSlug) to enable fast correlation and debugging.

## Goals

- Detect auth failures, payment issues, and video delivery problems in real-time
- Correlate events across request, user, and provider boundaries
- Enable fast incident response via Sentry alerts
- Track performance SLOs: auth success >=99.5%, webhooks >=99.9%, video-url p95 <500ms
- Minimize configuration complexity and operational overhead on Vercel free tier

## Technical Decisions

### Architecture

**Error Tracking & Performance Monitoring:**

- Use Sentry Next.js SDK with automatic source map upload via Vercel integration
- Configure Sentry to capture Next.js server and client errors, spans, and transactions
- Leverage Sentry's native Session Replay on free tier (up to 5% of sessions)

**Context & Enrichment:**

- Inject request context (requestId, userId, stripeEventId, lessonSlug, rateLimitKeyType) via:
  - Proxy for request tracking
  - Server Actions wrapper for critical mutations
  - API route error handlers
  - Manual `Sentry.captureException()` calls in webhook and video-url handlers
- Use Sentry's `setTag()` and `setContext()` to attach structured metadata

**Structured Logging:**

- Continue JSON logging to Vercel log drains (no external log service yet)
- Enhance logs with Sentry trace-id and error-id for log aggregation
- Log structured payloads (event-ids, error chains) to support Sentry search

**Alerts & Monitoring:**

- Configure Sentry-native alerts:
  - Auth API error rate spike (threshold: >0.5% failure rate)
  - Webhook processing errors (threshold: any non-200 response)
  - Video-url generation 403/500 errors (threshold: >1 per hour)
  - Unhandled promise rejections in critical paths
- Bind alerts to Slack webhook for on-call notification (if available)

### Technologies and Libraries

- **@sentry/nextjs** (latest stable): Official Sentry SDK for Next.js
  - Why: Automatic instrumentation, source map integration, zero-config for Vercel
- **Sentry free tier** (self-hosted alternative: optional relay):
  - Why: Covers ≤50 errors/day for ≤200 users/month; includes error tracking, some spans, basic alerts
- **Vercel built-in Sentry integration**:
  - Why: Automatic source map upload, environment binding, no extra tooling
- **Node.js `crypto` module** (built-in):
  - Why: Generate request-id headers; no external UUID library needed
- **No new external dependencies**:
  - Why: Minimize supply chain risk, simplify deployment

### Project Changes or Additions

**New Files:**

- `lib/sentry-context.ts`: Helper functions to set request context (userId, stripeEventId, etc.)
- `proxy.ts` (modify): Generate and attach request-id to all requests
- `lib/sentry-errors.ts`: Error classification and enhanced logging for critical paths
- `.sentry.auth.json` (env-based): Sentry auth token for source map upload
- `next.config.ts` (modify): Enable Sentry webpack plugin and source map upload

**Modified Files:**

- `app/api/auth/send-magic-link/route.ts`: Add Sentry context on success/failure
- `app/api/auth/consume-magic-link/route.ts`: Add Sentry context, guard single-use, log attempt count
- `app/api/webhooks/stripe/route.ts`: Add deduplication context, event-id logging, error classification
- `app/api/fulfill-premium-session/route.ts`: Add stripeEventId context, side-effect logging
- `components/acing-aufnahmetest/lesson-video-player.tsx`: Add error handling with video-url context
- `app/api/lessons/[slug]/video-url/route.ts`: Add lessonSlug context, refresh failure logging
- `actions/acing-aufnahmetest/send-magic-link-email.ts`: Add userId and event context
- `actions/acing-aufnahmetest/logout-user.ts`: Add user session tracking
- `tsconfig.json`: Add sourceMap and declarationMap for TypeScript source map support
- `.env.example`: Document new Sentry env vars (SENTRY_DSN, SENTRY_ENVIRONMENT, SENTRY_AUTH_TOKEN)
- `package.json`: Add @sentry/nextjs as dependency

## Security Considerations

**Sensitive Data Protection:**

- **Blocked fields**: Never log passwords, email addresses (use userId hash), Stripe secrets, JWT tokens
  - Implement Sentry `beforeSend()` scrubber to filter payloads
  - Use PII redaction: disable session recording of input fields
- **PII redaction**: Use Sentry's built-in masking for user identifiers
  - Log only userId (UUID), not email or names
  - Stripe event-id is safe to log (public event identifier)
- **Rate-limit context**: Log only keyType (user/ip/email) and bucket key hash, not actual IP or email
- **API secrets**: Use Vercel environment variable scoping (preview/production separation)

**Authentication & Authorization:**

- Sentry webhook signing: Verify webhook payloads with SENTRY_SIGNING_SECRET (optional, free tier)
- Restrict Sentry access to team members via invite links only
- Use environment-specific DSN keys per stage (dev, preview, production)

**Compliance:**

- Document Sentry data retention policy in DPA/privacy policy (Sentry free tier = 90 days)
- Exclude test/staging traffic via sample rates (80% production, 10% preview)

## Context Field Strategy

**Core fields (all critical requests):**

- `requestId`: UUID generated in proxy, correlates logs and spans
- `environment`: "production" | "preview" (from VERCEL_ENV)
- `region`: Auto-detected from Vercel headers or hardcoded "us-east-1"

**Auth paths (magic-link issue/consume):**

- `userId`: On successful token creation or verification
- `session_attempt_count`: Increment per failed consume attempt
- `token_version`: Semantic version of magic-link format (future-proof schema changes)

**Payment paths (checkout):**

- `stripeEventId`: Stripe event identifier from webhook payload
- `stripeCustomerId`: Stripe customer ID (safe PII)
- `fulfillment_result`: "granted" | "already_paid" | "invalid_customer"

**Video paths (url generation/refresh):**

- `lessonSlug`: Course lesson identifier (non-sensitive)
- `video_refresh_count`: Incremental counter per session
- `provider`: "cloudfront" (future-proof for multi-provider)

**Rate-limit context:**

- `rateLimitKeyType`: "user" | "ip" | "email" (not the actual key value)
- `rateLimitBucket`: Hash of key, not the raw key

## Instrumentation of Critical Paths

### 1. Magic-Link Issue (Auth Onboarding)

**File:** `app/api/auth/send-magic-link/route.ts`

| Step                   | Instrumentation                                                             |
| ---------------------- | --------------------------------------------------------------------------- |
| POST request received  | Sentry transaction start, attach requestId                                  |
| Email validation       | Log email domain (sanitized), hash_email                                    |
| Token generation       | Sentry span, set userId context on success                                  |
| Email send (Resend)    | Capture Resend response status and latency                                  |
| Success 200            | No Sentry success event (reduce noise); rely on structured app logs         |
| Error (rate limit)     | captureException(error), setTag("error_type", "rate_limit"), return 429     |
| Error (Resend failure) | captureException(error), setTag("error_type", "email_provider"), return 500 |

### 2. Magic-Link Consume (Login Validation)

**File:** `app/api/auth/consume-magic-link/route.ts`

| Step                                | Instrumentation                                                                                                  |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| POST request received (token param) | Sentry transaction start, attach requestId                                                                       |
| Token verification                  | Span for JWT decode, mark single-use in Redis, set attempt counter                                               |
| Concurrent access guard             | If second consume attempt detected → captureMessage("concurrent_consume_attempt"), increment counter, return 400 |
| Session creation                    | Set userId context (no success event capture)                                                                    |
| Success 200 + Set-Cookie            | setTag("outcome", "success"), log latency                                                                        |
| Error (invalid token)               | captureMessage("token_invalid"), setTag("error_type", "invalid_token"), return 401                               |
| Error (already consumed)            | captureMessage("token_already_consumed"), setTag("error_type", "replay_detected"), return 401                    |

### 3. Stripe Webhook Receive & Process

**File:** `app/api/webhooks/stripe/route.ts`

| Step                                     | Instrumentation                                                                                     |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------- |
| POST request received                    | Sentry transaction start, attach requestId, extract stripeEventId                                   |
| Signature verification                   | Span for webhook verification, fail fast if invalid                                                 |
| Idempotency check (Redis)                | Check stripe:webhook:{eventId}, log if already processed                                            |
| Event dispatch                           | Switch by event.type, create child span per type                                                    |
| checkout.session.completed → Fulfillment | Capture stripeEventId, stripeCustomerId, fulfillment_result tag                                     |
| All event types                          | Log event context: { eventId, type, timestamp, processed_at }                                       |
| Success 200                              | captureMessage("webhook_processed") only when fulfillment_result="granted"                          |
| Error (signature invalid)                | captureException(error), setTag("error_type", "signature_invalid"), return 401                      |
| Error (processing failed, retryable)     | captureException(error), setTag("error_type", "retryable"), return 500                              |
| Error (processing failed, non-retryable) | captureException(error), setTag("error_type", "non_retryable"), store completion marker, return 200 |

### 4. Checkout Session Fulfillment

**File:** `app/api/fulfill-premium-session/route.ts` (or `lib/fulfillment.ts`)

| Step                               | Instrumentation                                                                |
| ---------------------------------- | ------------------------------------------------------------------------------ |
| Fulfillment function entry         | Span start with stripeEventId, stripeCustomerId context                        |
| Query user from Stripe customer ID | Span for DB query, log user found/not found                                    |
| Grant premium role (Prisma)        | Span for role update, mark outcome as "granted" or "already_paid"              |
| Send confirmation email (Resend)   | Span for email send, capture latency                                           |
| Success outcome                    | setTag("fulfillment_result", "granted"), captureMessage("entitlement_granted") |
| Error (user not found)             | captureException(error), setTag("error_type", "user_not_found")                |
| Error (role update failed)         | captureException(error), setTag("error_type", "database_error")                |

### 5. Lesson Video-URL Generation

**File:** `app/api/lessons/[slug]/video-url/route.ts`)

| Step                             | Instrumentation                                                                                   |
| -------------------------------- | ------------------------------------------------------------------------------------------------- |
| GET request received             | Sentry transaction start, attach requestId and lessonSlug context                                 |
| Lesson slug validation           | Span for DB query, log slug validity, set lessonSlug context                                      |
| CloudFront signed-URL generation | Span with provider context ("cloudfront"), retry count context                                    |
| Success 200 + signed URL         | No Sentry success event (reduce noise)                                                            |
| Error (403 Forbidden)            | captureException(error), setTag("error_type", "forbidden"), setTag("likely_cause", "expired_key") |
| Error (500 from CloudFront)      | captureException(error), setTag("error_type", "provider_error"), return 503                       |
| Error (lesson not found)         | captureMessage("lesson_not_found"), setTag("error_type", "not_found"), return 404                 |

### 6. Client-Side Error Boundary

**File:** `components/acing-aufnahmetest/lesson-video-player.tsx`

| Step                  | Instrumentation                                                     |
| --------------------- | ------------------------------------------------------------------- |
| Video player mount    | None (remove debug mount signal to reduce noise)                    |
| Video URL fetch error | captureException(fetchError), attach lessonSlug context             |
| Playback error        | captureException(error), attach video error codes (MediaError.code) |
| User navigates away   | None (avoid cluttering error rate)                                  |

## Error Tracking and Structured Logging Strategy

**Error Classification:**

1. **Auth errors** (4xx): Expected, non-critical → log as info/warning, set severity "warning"
2. **Provider errors** (Stripe, Resend, CloudFront): Unexpected, may retry → log as error, set severity "error"
3. **Database errors**: Unexpected, may indicate schema/permission issues → log as error, set severity "critical"
4. **Rate-limit errors**: Expected, per policy → log as warning, set severity "warning"

**Structured Log Format (Vercel log drains):**

```json
{
  "timestamp": "2026-04-05T10:30:00Z",
  "level": "info|warn|error",
  "message": "token_already_consumed | webhook_processed | entitlement_granted | video_playback_error",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "550e8400-e29b-41d4-a716-446655440001",
  "stripeEventId": "evt_...",
  "lessonSlug": "lesson-1-intro",
  "sentry_trace_id": "trace_id_from_sentry_header",
  "sentry_event_id": "event_id_from_sentry",
  "error": { "message": "...", "stack": "..." },
  "context": { "rateLimitKeyType": "user", "fulfillment_result": "granted" }
}
```

**Breadcrumb Recording:**

- Enabled: HTTP requests, console logs, DOM events (client)
- Disabled: Request/response bodies (to avoid PII leakage)

## Initial Alert Configuration

**Alert 1: Auth API Failure Spike**

- **Condition:** Error rate in `api/auth/` paths > 0.5% (1 error per 200 requests)
- **Window:** 5 minutes
- **Action:** Send Slack notification with top 5 error types
- **Rationale:** Detects ≥1 failed login in 200-user cohort in 5 min window

**Alert 2: Webhook Processing Errors**

- **Condition:** Any non-200 response from `api/webhooks/stripe` in last 1 minute
- **Window:** 1 minute
- **Action:** Send Slack notification with event type and error
- **Rationale:** Webhooks must succeed; any failure indicates payment entitlement at risk

**Alert 3: Video-URL Generation Failures**

- **Condition:** 403/500 errors in `api/lessons/*/video-url` > 1 per hour
- **Window:** 1 hour
- **Action:** Send Slack notification with affected lesson slugs
- **Rationale:** Detects CloudFront key expiry or permission issues affecting video delivery

**Alert 4: Unhandled Promise Rejections**

- **Condition:** Server-side unhandled rejection in critical path detected
- **Window:** Real-time
- **Action:** Send Slack critical alert (severity: critical)
- **Rationale:** Indicates code defect; should be investigated immediately

**Setup Method:**

- Configure in Sentry UI: Alerts > Create Alert Rule
- Bind to Vercel Slack integration (existing) or Sentry Slack app
- Document alert rules in `.github/monitoring/ALERT_RUNBOOK.md`

## Environment Variables and Deployment Configuration

**New environment variables (add to `.env.example` and Vercel):**

```bash
# Sentry SDK Configuration
NEXT_PUBLIC_SENTRY_DSN=https://xxx@yyy.ingest.sentry.io/zzz         # Sentry project DSN
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production|preview|development        # Environment name
NEXT_PUBLIC_SENTRY_RELEASE=$VERCEL_GIT_COMMIT_SHA                    # Vercel commit SHA
SENTRY_AUTH_TOKEN=sntrys_...                             # For source map upload (CI/build only)
SENTRY_ORG=your-sentry-org                               # For source map upload
SENTRY_PROJECT=phi                                       # For source map upload

# Optional: Advanced
NEXT_PUBLIC_SENTRY_SAMPLE_RATE=0.2                                   # Replay/session sample rate (20%)
NEXT_PUBLIC_SENTRY_ERROR_SAMPLE_RATE=1.0                             # Capture 100% of errors
NEXT_PUBLIC_SENTRY_TRACE_SAMPLE_RATE=0.2                             # Trace 20% of transactions
```

**Vercel Environment Setup:**

1. Log into Vercel > Phi project > Settings > Environment Variables
2. Add NEXT_PUBLIC_SENTRY_DSN (production link only, no secrets in public env)
3. Add NEXT_PUBLIC_SENTRY_ENVIRONMENT as condition: production (for `main` branch)
4. NEXT_PUBLIC_SENTRY_RELEASE auto-populated via build-time injection
5. SENTRY_AUTH_TOKEN added only to CI environment (GitHub Actions or Vercel build)

**Deployment Flow:**

1. On `git push main`:
   - Vercel triggers build
   - Next.js build runs `next build`
   - Sentry webpack plugin uploads source maps to NEXT_PUBLIC_SENTRY_DSN
   - Release is tagged with commit SHA
2. On `git push preview/*`:
   - Similar flow with NEXT_PUBLIC_SENTRY_ENVIRONMENT=preview

## Files to Create/Modify

### New Files

| File                                                     | Purpose                                                                                                                 |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `lib/sentry-context.ts`                                  | Helper functions: setUserId(), setStripeEventId(), setLessonSlug(), setRateLimitContext(); manages Sentry context scope |
| `lib/sentry-errors.ts`                                   | Error classification: classifyError(error) → { type, retryable, severity }; enhanced logging                            |
| `proxy.ts`                                               | Generate request-id header; attach to Sentry context; forward to API responses                                          |
| `.sentry.auth.json`                                      | Sentry auth config for source map upload (git-ignored, loaded from env via build script)                                |
| `.github/monitoring/ALERT_RUNBOOK.md`                    | Alert response procedures: what to do when each alert fires                                                             |
| `.github/monitoring/SENTRY_INSTRUMENTATION_CHECKLIST.md` | DevOps checklist: Sentry org setup, DSN provisioning, alert creation                                                    |
| `.github/monitoring/CONTEXT_FIELDS_REFERENCE.md`         | Reference doc for all context fields by path (for future instrumentation)                                               |

### Modified Files

| File                                                    | Change                                           | Rationale                           |
| ------------------------------------------------------- | ------------------------------------------------ | ----------------------------------- |
| `next.config.ts`                                        | Add Sentry webpack plugin + source map config    | Enable automatic source map upload  |
| `tsconfig.json`                                         | Set `sourceMap: true` and `declarationMap: true` | Support TypeScript source maps      |
| `package.json`                                          | Add `@sentry/nextjs` dependency                  | Core instrumentation                |
| `.env.example`                                          | Add SENTRY\_\* variables                         | Document configuration              |
| `app/api/auth/send-magic-link/route.ts`                 | Wrap with Sentry context capture                 | Trace auth onboarding               |
| `app/api/auth/consume-magic-link/route.ts`              | Add concurrent access guard + Sentry logging     | Trace login attempts, detect replay |
| `app/api/webhooks/stripe/route.ts`                      | Add stripeEventId context + error classification | Trace critical payment paths        |
| `app/api/fulfill-premium-session/route.ts`              | Wrap with Sentry context + side-effect logging   | Trace entitlement grants            |
| `app/api/lessons/[slug]/video-url/route.ts`             | Add lessonSlug context + error classification    | Trace video delivery                |
| `components/acing-aufnahmetest/lesson-video-player.tsx` | Add client-side error capture                    | Trace playback issues               |
| `actions/acing-aufnahmetest/send-magic-link-email.ts`   | Attach userId context                            | Trace email sending                 |
| `actions/acing-aufnahmetest/logout-user.ts`             | Log session termination                          | Track user lifecycle                |

## Implementation Notes

**Sentry Setup Cost:** FREE (free tier covers ≤50 errors/day, ≤200 sessions/day, basic alerts)

**Simplicity Rationale:**

- Use Sentry defaults; avoid custom integrations or enrichment plugin chains
- `beforeSend()` filter is minimal (PII scrubbing only)
- No custom transport; use standard HTTP transport
- Proxy generates request-id once per request (no per-span overhead)

**Security Rationale:**

- PII: userId logged as UUID; email, IP, keys never logged
- Sample rates: 20% replay sessions, 20% traces, 100% errors (balanced for low traffic + cost control)
- Auth token stored in Vercel CI environment only (not in repo)

**Performance Overhead:**

- Sentry SDK: ~100KB gzipped (shared bundle, minimal impact)
- Request-id generation: 1-2ms per request (negligible)
- Error capture: <1ms when no error (deferred to event loop)
- Source map upload: ~5s per build (async, CI only)

**Low-Traffic Justification:**

- 200 users/month × 10 avg sessions per user = 2k sessions/month = ~67 sessions/day
- Even with 5% error rate = 3.35 errors/day (well below 50-error free limit)
- No need for paid plan; no need for dedicated log sink
- Vercel log drains sufficient for structured logging backup

## Testing Strategy

**Pre-launch validation (manual):**

1. **Auth errors**: Issue invalid magic-link in production, verify Sentry capture
2. **Webhook errors**: Trigger Stripe webhook failure (invalid signature), verify dedup + error logging
3. **Video-URL errors**: Request non-existent lesson slug, verify error capture + context
4. **Alert testing**: Manually fire alert condition, verify Slack notification
5. **Source map upload**: Verify production build includes source maps in Sentry

**Continuous validation (post-launch):**

- Monitor Sentry dashboard daily for first week
- Verify context fields are present in >95% of errors
- Check alert configurations match documented thresholds
- Archive weekly error summaries for trend analysis

# Feature: Course Analytics Events Instrumentation

## Overview

Add focused Google Analytics event instrumentation to the Acing Aufnahmetest login, purchase, and lesson playback flows using the existing client-side analytics utility. Track key conversion and engagement events without introducing backend contract changes.

## Goals

- Track send magic link button clicks from the Acing Aufnahmetest login flow.
- Track Stripe checkout render in the Acing Aufnahmetest purchase flow.
- Track lesson opened with a lesson identification parameter.
- Track lesson watch milestones at 25%, 50%, and 90%.
- Track lesson completion as a repeatable completion signal.
- Keep existing API routes and server contracts stable.

## Technical Decisions

### Architecture

Use existing client components in the Acing Aufnahmetest flow as the instrumentation boundaries:

- Login interaction event in the login form submit path.
- Checkout render event in the Stripe checkout client component on first mount.
- Lesson opened, watch milestones, and lesson completion in the lesson video player client component.

Use the existing Google Analytics utility in lib as the single event dispatch layer. Keep event payload assembly in each component and avoid adding new API endpoints, server actions, or schema changes.

### Technologies and Libraries

- **Next.js App Router + existing Client Components**: Simplest place to capture UI interactions and media events where they occur.
- **Existing GA helper (lib/google-analytics.ts)**: Reuse current registerAnalyticsEvent utility to avoid dependency and contract churn.
- **Native HTMLVideoElement events/time tracking**: Lowest-cost and sufficient for <=200 users/month while providing accurate milestone and rewatch signals.
- **No new dependencies**: Keeps implementation simple, secure, and low maintenance.

### Project Changes or Additions

- **components/acing-aufnahmetest/login-form.tsx**: Fire analytics event on user intent to send magic link (button click / form submit attempt).
- **components/acing-aufnahmetest/stripe-checkout-form.tsx**: Fire analytics event once when embedded Stripe checkout renders.
- **components/acing-aufnahmetest/lesson-video-player.tsx**: Add lesson_opened, watched milestone, and lesson_completed instrumentation using video lifecycle events.
- **lib/google-analytics.ts**: Optional typed helper refinement for strongly typed analytics action names and parameter shapes used by this feature.
- **app/acing-aufnahmetest/lessons/(lesson-area)/[slug]/page.tsx**: No change required for lesson identification because slug is already passed to lesson player and can be used as the required identification parameter.

### Event Contract (Client Analytics)

Define and use these exact tracking intents:

1. **Send magic link button clicks**
   - Trigger: user submits login form (primary CTA interaction).
   - Event action: send_magic_link_click
   - Params: { flow: "acing-aufnahmetest" }

2. **Stripe checkout render**
   - Trigger: checkout component first client render.
   - Event action: stripe_checkout_render
   - Params: { flow: "acing-aufnahmetest" }

3. **Lesson opened (with lesson identification param)**
   - Trigger: lesson video player mounts for a lesson.
   - Event action: lesson_opened
   - Params: { lesson_slug: string }

4. **25%, 50%, and 90% of lesson watched**
   - Trigger: first crossing of each threshold based on currentTime / duration.
   - Event actions:
     - lesson_watched_25
     - lesson_watched_50
     - lesson_watched_90
   - Params: { lesson_slug: string }
   - Guard: each threshold fires once per page session.

5. **Lesson completion**
   - Trigger: video playback reaches 90% watched.
   - Event action: lesson_completed
   - Params: { lesson_slug: string }
   - Counting rule: emit once when the 90% milestone is reached for that playback session.

## Security Considerations

- Do not send PII in analytics payloads (no email, token, user id, or payment secrets).
- Restrict analytics params to non-sensitive identifiers (lesson_slug, static flow labels, numeric counters).
- Keep all instrumentation client-side for this feature to avoid introducing new server attack surface.
- Preserve existing auth/payment/video contracts; no API route or server action shape changes.
- Keep event volume bounded with one-time guards for render/open/milestone events to reduce accidental noisy telemetry.

## File Checklist

### New Files

- None

### Modified Files

- `components/acing-aufnahmetest/login-form.tsx`
- `components/acing-aufnahmetest/stripe-checkout-form.tsx`
- `components/acing-aufnahmetest/lesson-video-player.tsx`
- `lib/google-analytics.ts` (if typed event helper refinement is implemented)

### Explicitly Not Modified

- `app/acing-aufnahmetest/lessons/(lesson-area)/[slug]/page.tsx` (lesson slug already available in player props for identification param)
- Blog-related pages/components (out of scope)

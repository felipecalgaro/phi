# Feature: Magic Link Roadmap Flow

## Overview

Add a third magic-link path for the Questions Card: keep the current no-redirect and purchase flows, and add a roadmap flow that sends the existing magic-link email action from the client with the full question payload. The temporary JWT should carry the roadmap answers plus a redirect target for future downstream use, while the auth API route remains unchanged in this task.

## Goals

- Let the final "Generate roadmap" button in `QuestionsCard` call the existing `sendMagicLinkEmail` server action directly from the client.
- Keep the existing login form and purchase flow working without contract breakage.
- Include all collected question answers in the temporary magic-link JWT for the roadmap flow.
- Add an explicit redirect target claim for `none`, `purchase`, or `roadmap`.
- Keep the implementation simple, server-side for token creation, and low-cost.

## Technical Decisions

### Architecture

Keep the current server action as the single email-sending entry point and extend its request shape so it can accept optional flow context. The Questions Card will remain a client component and will submit the final step by calling the server action directly, while the login form continues to pass only `email`.

Do not change `app/api/auth/route.ts` in this task. The new JWT claims are additive, so the current route can keep parsing the existing payload shape without breaking, and the roadmap redirect claim can be consumed later without another token format change.

### Technologies and Libraries

- **Next.js Server Actions**: Reuse the current action instead of adding a new API route or client fetch layer.
- **React client state in `QuestionsCard`**: Keep the submit flow local to the existing component; no new state library is needed.
- **Zod**: Validate the extended request payload at the server boundary and keep malformed data out of the token.
- **Existing JWT helper in `lib/jwt.ts`**: No changes needed; it already signs arbitrary payload data.

### Project Changes or Additions

- **`components/questions-card.tsx`**: Replace the last-step button behavior with a direct server-action call that sends `email`, the collected answers, and `redirectTarget: "roadmap"`.
- **`actions/acing-aufnahmetest/send-magic-link-email.ts`**: Extend the request contract to accept optional flow context, keep the current email-only path working, and add the extra JWT claims for roadmap payload data.
- **`actions/acing-aufnahmetest/send-magic-link-email.ts`**: Preserve the current `redirect_to_purchase` cookie behavior for the purchase flow so the existing flow stays intact.

### Data Shape

Use one backward-compatible request shape for all callers:

```ts
type MagicLinkRedirectTarget = "none" | "purchase" | "roadmap";

type RoadmapAnswers = {
  countryOfHighschool: string;
  citizenships: string[];
  plannedStudienkollegs: string[];
  plannedAttendance: {
    year: string;
    semester: "Winter" | "Summer";
  };
  subscribedToMarketing: boolean;
};

type SendMagicLinkRequest = {
  email: string;
  redirectTarget?: MagicLinkRedirectTarget;
  answers?: RoadmapAnswers;
};
```

The temporary token should keep the existing fields needed by the auth route and add the new claims:

```ts
{
  email: string;
  jti: string;
  redirectToPurchase: boolean;
  redirectTarget: MagicLinkRedirectTarget;
  answers?: RoadmapAnswers;
}
```

## Security Considerations

- Validate the full request body with Zod before any token creation or email send.
- Keep token signing and cookie access inside the server action only.
- Preserve the existing rate limiting and Sentry error handling path.
- Do not log the roadmap answers or raw token payload.
- Keep the auth API route untouched in this task so the change remains narrowly scoped and backward compatible.

## File Checklist

### Modified Files

- `components/questions-card.tsx`
- `actions/acing-aufnahmetest/send-magic-link-email.ts`

## Validation

- Run a focused typecheck/lint pass on the touched files, then manually verify the Questions Card submits the roadmap flow with the full answer payload while the login form still sends an email-only request.

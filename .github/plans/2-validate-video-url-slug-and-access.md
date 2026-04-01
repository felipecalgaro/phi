# Feature: Validate Video URL Slug and Access Before Signing

## Overview

Harden the video URL signing endpoint to validate lesson existence by slug lookup and ensure caller has access rights before generating signed CloudFront URLs. Currently, the endpoint relies only on role-based auth (PREMIUM vs BASIC) without verifying the slug resolves to an actual lesson, allowing authenticated users to probe non-existent slugs and receive signed URLs for non-existent content.

## Goals

- Validate lesson exists in database before signing any URL
- Return 404 JSON when slug does not resolve to a valid lesson
- Validate caller has access to the lesson (currently role-based; extensible for future entitlement logic)
- Add Cache-Control headers to prevent caching of sensitive signed URLs
- Maintain security posture: invalid slug never yields signed URL; unauthorized users consistently receive 401/403

## Technical Decisions

### Architecture

The fix is focused on the single endpoint: `app/api/lessons/[slug]/video-url/route.ts`

Current flow:

1. Rate limit check
2. Auth check (401 if unauthenticated)
3. Role check (403 if BASIC user)
4. **[MISSING]** Lesson slug validation
5. Generate signed URL
6. Return response

New flow (additions in **bold**):

1. Rate limit check
2. Auth check (401 if unauthenticated)
3. Role check (403 if BASIC user)
4. **Lookup lesson by slug in Prisma**
5. **If not found, return 404 JSON**
6. **Validate access (currently role is sufficient; can extend later)**
7. Generate signed URL
8. **Add Cache-Control: private, no-store header**
9. Return response

### Technologies and Libraries

- **Prisma ORM**: Already in use for all database queries. Use `prisma.lesson.findUnique({ where: { slug } })` to validate lesson existence.
- **NextResponse**: Already imported and used. Layer Cache-Control header into response object.
- **Existing auth utils** (`verifySession` from `lib/dal`): Already present; no new dependencies.

### Project Changes or Additions

#### Modified Files

**`app/api/lessons/[slug]/video-url/route.ts`**:

- Import `prisma` from `@/lib/prisma` (already imported in sibling lesson routes).
- After role check (line 32), add Prisma query: `const lesson = await prisma.lesson.findUnique({ where: { slug } })`.
- Check if lesson exists; if not, return `NextResponse.json(..., { status: 404 })` with JSON error object.
- Keep signing logic unchanged.
- Add Cache-Control header to response: `response.headers.set('Cache-Control', 'private, no-store')`.
- Keep error handling for signing failures (status 500).

**No schema changes required**: The `Lesson` model already has `slug` as a unique field; no modifications needed.

## Security Considerations

### Lesson Existence Validation

- **Problem**: Without slug validation, authenticated users can generate signed URLs for non-existent lessons, potentially probing video URL patterns or the S3/CloudFront structure.
- **Solution**: Query the database before signing. If no lesson exists, return 404, not 500 or a signed URL.
- **Risk mitigation**: This prevents unauthorized probing and ensures only valid lessons are exposed.

### Access Control

- **Current**: Role-based only (PREMIUM role grants access; BASIC users blocked at gateway).
- **Future extensibility**: The plan is designed to allow per-lesson access rules if entitlements are added later (e.g., user must own the course, or lesson is restricted to certain regions). For now, role is sufficient.
- **Design**: Lesson lookup happens before signing; future access check can be inserted between lesson validation and signing without restructuring.

### Signed URL Security

- **TTL**: CloudFront signed URL already has TTL (600 seconds default). Signing happens server-side only (server-only context).
- **Caching**: Adding `Cache-Control: private, no-store` prevents intermediate proxies or CDNs from caching the response. Critical because the signed URL itself is a bearer-like credential for its TTL window.
- **Logging**: Keep existing error logging; add lesson slug to context when validation fails (for debugging).

### Error Response Consistency

- **401**: Unauthenticated (no token).
- **403**: Authenticated but unauthorized (BASIC user or, in future, no lesson entitlement).
- **404**: Lesson does not exist (invalid slug).
- **500**: Internal failure (signing error, Prisma error, etc.).

## File Checklist

### New Files

None.

### Modified Files

- `app/api/lessons/[slug]/video-url/route.ts`

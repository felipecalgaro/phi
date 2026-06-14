# AGENTS.md

## Project Overview

Phi is a web platform for Studienkolleg entrance exam (Aufnahmeprüfung) preparation. It includes searchable exercises, paid course content, blog content, password-free magic link authentication, Stripe payments, and protected video delivery through AWS CloudFront/S3 signed URLs.

## Tech Stack

- Framework: Next.js 16 with React 19
- Language: TypeScript
- Styling: Tailwind CSS, Radix UI, shadcn components, lucide-react icons
- Data: PostgreSQL with Prisma and Redis
- Auth: Magic link flow with JWT cookies and proxy/middleware protection
- Payments: Stripe
- Email: Resend
- Observability: Sentry
- Infrastructure: Vercel, AWS (S3, CloudFront), Neon (PostgreSQL), Upstash (Redis), Cloudflare

## Common Commands

- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Typecheck: `npm run typecheck`
- Lint: `npm run lint`
- Build: `npm run build`
- Start production server: `npm run start`
- Magic link replay test: `npm run test:magic-link-replay`
- Stripe webhook replay test: `npm run test:stripe-webhook-replay`
- Checkout e2e test: `npm run test:checkout-e2e`

## Repository Layout

- `app/`: Next.js app routes, layouts, pages, route handlers, and server/client components.
- `components/`: Shared UI and feature components.
- `actions/`: Server actions.
- `lib/`: Shared application logic, integrations, auth/payment/data helpers, and utilities.
- `hooks/`: React hooks.
- `data/`: Static or structured project data.
- `prisma/`: Prisma schema and database configuration.
- `public/`: Static assets.
- `tests/`: Scripted replay/e2e checks.
- `generated/`: Generated code or artifacts. Do not edit by hand.
- `utils/`: General-purpose utilities.

## Project Documentation

- Server action convention: `docs/development/server-action.md`
- API route convention: `docs/development/api-route.md`

## Coding Guidelines

- Follow the existing patterns in the surrounding files before introducing a new abstraction.
- Keep changes focused on the user request.
- Prefer server components and server-side validation for sensitive data flows.
- Treat authentication, authorization, Stripe webhooks, magic links, video access, and redirects as security-sensitive.
- Do not log secrets, tokens, signed URLs, cookies, or payment data.
- Use structured APIs and existing helpers instead of ad hoc parsing or duplicated integration logic.
- Use lucide-react for icons and shadcn components for UI consistency.
- Keep UI text and layout responsive; verify compact/mobile states for user-facing changes.
- Do not edit `.env` values or add secrets to tracked files.
- Avoid concatenating Tailwind classes manually. Use the `cn` utility for conditional or composed class names.

## Testing And Verification

Before finishing code changes, run the smallest relevant checks:

- `npm run typecheck`
- `npm run lint`
- `npm run build` for broad framework, route, or config changes
- The relevant replay/e2e script when touching magic links, Stripe webhooks, or checkout

If a command cannot be run, report why and describe the residual risk.

## Working Notes

- This project is still under development, so preserve useful notes unless the user asks to reorganize them.
- Ask before large rewrites, route restructuring, database migrations, or deleting user-authored content outside obsolete tooling/configuration.

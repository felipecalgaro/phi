# Copilot Instructions for Phi Workspace

## Project Architecture

- Next.js 16+ fullstack application with TypeScript.
- Core technologies:
  - **Frontend**: React components with App Router, TailwindCSS for styling.
  - **Backend**: Next.js API routes (`app/api/**`) and Server Actions.
  - **Database**: Prisma ORM with PostgreSQL.
  - **Auth**: JWT-based authentication with magic links via Resend.
  - **Payments**: Stripe integration for purchases.
- Keep boundaries clear:
  - `app/` owns page layouts and API routes.
  - `components/` owns reusable UI components.
  - `lib/` and `utils/` own shared business logic, data access, and utilities.
  - `actions/` owns Server Actions for form submissions and mutations.
  - `data/` owns static data files (blog posts, exercises).
  - `prisma/` owns database schema and migrations.
- App deployed on Vercel free tier.
- PostgreSQL database deployed on Supabase free tier.
- Redis deployed on Upstash free tier.
- Course lessons stored on AWS S3 and served via CloudFront.

## Agent-Oriented Workflow

- Default to orchestrator-first workflow for end-to-end features.
- Three agents collaborate:
  - **Planner**: Creates implementation plan in `.github/plans/{number}-{name}.md`.
  - **Operator**: Implements changes following the plan and design rules.
  - **Orchestrator**: Coordinates planner and operator, validates contracts and integration.
- Process flow:
  1. Orchestrator receives feature request.
  2. Orchestrator delegates to planner to create detailed implementation plan.
  3. Orchestrator delegates to operator to implement plan.
  4. Orchestrator validates contract compatibility and integration.

## Design Rules for Implementation

**Minimalist and modern design:**

- Clean, focused layouts prioritizing content and user action.
- Avoid decorative elements unless they enhance clarity.

**TailwindCSS only:**

- All styling via Tailwind utility classes.
- No arbitrary values (e.g., `w-[123px]`).

**Component organization:**

- Keep components small and focused.
- One component per dedicated file.
- Extract components if: (1) has its own logic, (2) reusable, or (3) is a Client Component.
- Use `function` keyword declarations, no explicit return types.
- Avoid comments; keep code self-documenting.

**NextJS best practices:**

- Use Server Components by default; only mark `'use client'` when needed (interactivity, hooks, browser APIs).
- Keep Server Actions in `actions/**` folder, export from that location.
- Use API routes under `app/api/**` for REST endpoints consumed by external clients.
- Use Prisma for all database queries; keep data operations in `lib/` utilities or Server Actions.
- Leverage middleware and hooks from `lib/` (e.g., `lib/dal.ts` for data access, `lib/jwt.ts` for auth).

## Code Style

- Use `function` keyword for function declarations, not arrow functions or implicit returns.
- No explicit return types on functions (let TypeScript infer).
- No unnecessary comments; code should speak for itself.
- Keep TypeScript types strongly typed; prefer explicit types in Prisma/API contracts.
- Name all files with kebab-case.

## Quality and Validation

- Prefer small, reviewable changes that follow existing conventions.
- Run checks when practical:
  - `npm run lint` for ESLint compliance.
  - `npm run typecheck` for TypeScript errors.
- If checks are not run, explicitly report what was skipped and why.
- Preserve backward compatibility in API contracts; coordinate cross-layer changes.

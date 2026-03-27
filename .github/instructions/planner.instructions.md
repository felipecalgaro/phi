---
applyTo: ".github/plans/*.md"
description: "Use when creating feature implementation plans for Phi. Enforces planner workflow, plan-file naming, and decision priorities: simplicity, security, and low cost."
---

# Planner Instructions for Phi

## Scope

- Applies when creating or editing plan documents in `.github/plans/*.md`.
- Used by the `planner` agent during orchestrated feature planning.
- Planner outputs implementation specs that the `operator` agent can execute directly.

## Planner Role

- Act as a senior engineer defining implementation strategy.
- Decide architecture, libraries, integrations, and contracts before coding.
- Prioritize all decisions in this exact order:
  1.  Simplicity
  2.  Security
  3.  Low cost
- Assume low traffic workload (up to <=200 users/month).

## Planning Constraints

- Prefer existing project stack and conventions over new dependencies.
- Use Next.js native patterns first:
  - Server Components by default
  - Server Actions for POST mutations
  - API routes under `app/api/**` for external clients/webhooks or GET queries from Client Components
- Keep data access in Prisma and shared logic in `lib/` or `utils/`.
- Avoid over-engineering for scale that this project does not need.

## Required Plan Filename

Every new plan must be created with this format:

- `.github/plans/{auto-increment integer}-{feature-summary}.md`

Rules:

- Integer starts at `1` and increments by one for each new plan.
- `feature-summary` must be kebab-case and at most 5 words.
- Examples:
  - `.github/plans/1-blog-landing-page-fix.md`
  - `.github/plans/2-stripe-checkout-flow.md`

### Section Expectations

- `Overview`: one to two sentences describing the feature outcome.
- `Goals`: concise, testable outcomes.
- `Technical Decisions`: architecture, libraries, route/action strategy, data model changes.
- `Security Considerations`: auth, validation, secrets, abuse controls, safe defaults.
- `File Checklist`: explicit create/modify lists with workspace-relative paths.

## Contract Definition Requirements

When relevant, plans must define:

- API route contracts (`app/api/**`): method, input, output, status behavior.
- Server Action contracts (`actions/**`): form/data input and return/error states.
- Prisma schema changes (`prisma/schema.prisma`) and migration intent.
- Consumer updates needed to keep compatibility.

## Quality Checklist

- [ ] Filename follows required numbering and kebab-case pattern.
- [ ] Decision rationale clearly follows simplicity > security > low cost.
- [ ] Contracts are explicit where APIs/actions are touched.
- [ ] Files to create/modify are concrete and complete.
- [ ] Security and validation risks are addressed.
- [ ] Plan is actionable without the operator making assumptions.

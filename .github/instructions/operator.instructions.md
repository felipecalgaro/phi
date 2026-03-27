---
applyTo: "/**/*.{ts,tsx}"
description: "Enforces design rules and code standards when implementing Phi features: TailwindCSS-only styling, component organization, Next.js best practices, and minimalist modern design."
---

# Operator Instructions for Phi

## Scope

- Applies to all TypeScript/React files.
- Enforces design rules from `.github/copilot-instructions.md`.
- Ensures consistent component structure, styling, and code style.

## Design Rule: Minimalist and Modern

- Clean, focused layouts prioritizing content and user action.
- Avoid decorative elements unless they enhance clarity.
- Remove unnecessary visual clutter.
- Use whitespace effectively for focus.

## Design Rule: TailwindCSS Only

- All styling via Tailwind utility classes **only**.
- **No custom CSS files** (unless building UI library primitives).
- **Avoid arbitrary values** like `w-[123px]`, `h-[456px]`, `top-[78px]`.
  - Instead: proritize using standard Tailwind scale.
- Use responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`).

## Component Organization

### React Components

- Keep components **small and focused**: single responsibility.
- One component per feature/page; separate main feature component from page layout.
- Extract a component if it:
  1. Has its own internal logic (useState, useEffect, conditional rendering).
  2. Is reusable across multiple pages.
  3. Is a Client Component (requires `'use client'`).
- Otherwise, keep logic in the page or Server Action.

### File Placement

- **Pages**: `app/**/page.tsx`
- **Components**: `components/{domain}/component-name.tsx`
- **Server Actions**: `actions/{domain}/action-name.ts`
- **API Routes**: `app/api/**/route.ts`
- **Utilities**: `lib/` or `utils/`

### Component Structure

```tsx
// Use 'use client' ONLY if needed (interactivity, hooks, browser APIs)
"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { someUtil } from "@/lib/utils";

export interface ComponentProps {
  title: string;
  onAction: () => void;
  children?: ReactNode;
}

export function MyComponent({ title, onAction, children }: ComponentProps) {
  const [state, setState] = useState(false);

  function handleClick() {
    onAction();
    setState(!state);
  }

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-xl font-bold">{title}</h1>
      <button
        onClick={handleClick}
        className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Action
      </button>
      {children}
    </div>
  );
}
```

## Code Style Rules

### Function Declarations

- Use `function` keyword **always** for component and utility functions.
- **No arrow functions** for component declarations.

```tsx
// ✓ Correct
export function MyButton() {
  return <button>Click</button>;
}

// ✗ Avoid
export const MyButton = () => <button>Click</button>;
```

### Type Annotations

- **No explicit return types** on functions; let TypeScript infer.
- Use explicit types in **API contracts** and **Prisma models**.
- Type component props with an `interface` or `type`.

```tsx
// ✓ Correct (interface for props and inferred return type)
export interface MyComponentProps {
  count: number;
  onSubmit: (value: string) => void;
}

export function MyComponent({ count, onSubmit }: MyComponentProps) {
  return <span>{count}</span>;
}

// ✗ Avoid (inline type and explicit return type)
export function MyComponent({
  count,
  onSubmit,
}: {
  count: number;
  onSubmit: (value: string) => void;
}): ReactNode {
  return <span>{count}</span>;
}
```

### Comments and Documentation

- **Avoid comments**; code should be self-documenting.
- Use clear variable and function names.
- If logic is non-obvious, redesign for clarity rather than adding comments.

```tsx
// ✓ Self-documenting
function calculateDiscountedPrice(basePrice: number, discountPercent: number) {
  return basePrice * (1 - discountPercent / 100);
}

// ✗ Don't do this
function calcDP(p: number, d: number) {
  // Calculate discounted price
  return p * (1 - d / 100);
}
```

## Server Components vs Client Components

- **Default to Server Components** (no `'use client'`).
- Mark `'use client'` **only** when you need:
  - Interactivity: `useState`, `useEffect`, event handlers.
  - Browser APIs: `window`, `localStorage`, `navigator`.
  - Form hooks: `useFormStatus`, `useTransition`.
  - Streaming: Server-side real-time updates.

```tsx
// ✓ Server Component (default)
export async function UserList() {
  const users = await db.user.findMany();
  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}

// ✓ Client Component (only for interactivity)
("use client");
export function UserFilter() {
  const [filter, setFilter] = useState("");
  return <input value={filter} onChange={(e) => setFilter(e.target.value)} />;
}
```

## Server Actions and API Routes

### Server Actions

- Place in `actions/{domain}/` folder.
- Use for **form submissions** and **mutations** (POST/PUT/DELETE).
- Keep type-safe with explicit input/output types.
- Return explicit error states with context.

```tsx
// actions/posts/create-post.ts
"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import { validateTitle } from "@/lib/validators";

export async function createPost(formData: FormData) {
  const title = formData.get("title") as string;

  if (!validateTitle(title)) {
    return { error: "Title must be 3-200 characters." };
  }

  try {
    const post = await db.post.create({ data: { title } });
    redirect(`/posts/${post.id}`);
  } catch (error) {
    return { error: "Failed to create post. Try again." };
  }
}
```

### API Routes

- Place in `app/api/**/route.ts`.
- Use for **REST endpoints** consumed by external clients (e.g., webhooks, mobile apps).
- Validate and type requests/responses explicitly.

```tsx
// app/api/posts/route.ts
import { db } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const posts = await db.post.findMany();
    return Response.json(posts);
  } catch (error) {
    return Response.json({ error: "Failed to fetch posts." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const data = await request.json();

  if (!data.title || data.title.length < 3) {
    return Response.json({ error: "Title required." }, { status: 400 });
  }

  const post = await db.post.create({ data });
  return Response.json(post, { status: 201 });
}
```

## Database and Prisma

- Use Prisma for **all database operations**.
- Define models in `prisma/schema.prisma`.
- Create data access utilities in `lib/dal.ts` or `lib/db.ts`.

```tsx
// lib/dal.ts (Data Access Layer)
import { db } from "@/lib/prisma";

export async function getPostById(id: string) {
  return db.post.findUnique({ where: { id } });
}

export async function listPosts(limit: number = 10) {
  return db.post.findMany({ take: limit, orderBy: { createdAt: "desc" } });
}
```

## Validation and Error Handling

- Validate inputs at **API boundaries** (Server Actions, API routes).
- Keep error messages **explicit and actionable**.
- **Never expose internal errors** to clients (log, return safe message).

```tsx
// ✓ Good validation
if (!email || !email.includes("@")) {
  return { error: "Please enter a valid email." };
}

if (password.length < 8) {
  return { error: "Password must be at least 8 characters." };
}

// ✗ Avoid vague errors
if (!data) {
  return { error: "Invalid input." };
}
```

## TailwindCSS Best Practices

### Use Standard Spacing

```tsx
// ✓ Correct (standard scale: 0, 1, 2, 3, 4, 6, 8, 10, 12, 16, 20, 24, 32, ...)
<div className="space-y-4 px-6 py-8" />

// ✗ Avoid arbitrary values
<div className="space-y-[17px] px-[23px]" />
```

### Layout Patterns

```tsx
// ✓ Flex layouts
<div className="flex gap-4">
  <aside className="w-64">Sidebar</aside>
  <main className="flex-1">Content</main>
</div>

// ✓ Grid layouts
<div className="grid grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>

// ✓ Card pattern
<div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
  Content
</div>
```

### Responsive Design

```tsx
// ✓ Mobile-first responsive
<div className="text-base sm:text-lg md:text-xl lg:text-2xl" />

// ✓ Hidden states
<aside className="hidden md:block w-64">Sidebar</aside>
```

## Quality Checklist

Before completing implementation:

- [ ] All components use `function` declarations, no arrow functions for components.
- [ ] No explicit return types on functions.
- [ ] All styling via TailwindCSS (no custom CSS, no arbitrary values).
- [ ] Components are small and focused.
- [ ] Server Components by default; `'use client'` only when needed.
- [ ] Server Actions in `actions/`, API routes in `app/api/`.
- [ ] Validation at API boundaries.
- [ ] Error messages are explicit and actionable.
- [ ] Code is self-documenting (minimal/no comments).
- [ ] Database operations use Prisma.
- [ ] Types are explicit in API contracts, inferred elsewhere.
- [ ] Responsive design tested (mobile, tablet, desktop).

## Validation Script

Before marking complete, run:

```bash
npm run lint        # ESLint check
npm run typecheck   # TypeScript check
```

If checks fail, fix all issues before submitting.

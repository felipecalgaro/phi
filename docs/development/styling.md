# Styling Guide

Use this guide when creating or updating user-facing UI in Phi.

## Visual Direction

The platform design is inspired by Base44's website: modern, minimalist,
polished, and aesthetic without feeling decorative or crowded.

Prefer clean white surfaces and strong spacing. Page backgrounds should usually
be `bg-background`, `bg-white`, or `hero-background`. Use gradient backgrounds
only when they already match an existing platform pattern, such as the homepage
feature sections.

The best reference for the platform's design language is the roadmap page in `app/roadmap/page.tsx`. New marketing or onboarding surfaces should feel
compatible with that section: centered composition, generous spacing, soft
accent gradients, rounded cards, subtle borders, and clear primary actions.

## Tokens And Color

- Use semantic Tailwind tokens from `app/globals.css`: `bg-background`,
  `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`,
  `ring-ring`, `bg-primary`, and `bg-secondary`.
- Avoid hard-coded grays and arbitrary colors unless there is no matching token
  and the choice is intentionally local.
- Use `text-gradient-accent` for rare emphasis, especially hero-level words.
- Keep most interfaces light. Dark or saturated gradient sections should be
  reserved for high-impact marketing sections, course highlights, or places
  that already use `--gradient-hero`, `--gradient-red`, or `--gradient-gold`.

## Borders And Radius

- Use borders often. Cards, panels, inputs, controls, menus, and subtle grouped
  areas should usually include `border border-border`.
- Always use `border-border` for standard borders. Avoid `border-gray-*` unless
  a component has a specific, reviewed reason.
- Preferred border radius values are `rounded-3xl` for cards, panels, and large
  containers, and `rounded-full` for buttons, pills, badges, avatars, and step
  indicators.
- Keep other radius values rare. If a shadcn/Radix primitive ships with a
  smaller radius, only override it when the surrounding UI needs platform
  consistency.

## Layout

- Use generous section spacing, usually `py-20` to `py-24` for major landing
  sections and responsive horizontal padding like `px-4`, `px-6`, `sm:px-8`,
  or `lg:px-12`.
- Keep content width constrained with `max-w-*` containers so pages remain easy
  to scan on wide screens.
- Prefer simple flex or grid layouts with clear hierarchy over decorative card
  stacks.
- Avoid nesting cards inside cards. Use unframed layout sections and reserve
  cards for actual repeated items, forms, panels, and modals.
- Verify compact and mobile states when changing user-facing layouts. Text
  should not overlap, clip, or depend on viewport-scaled font sizes.

## Components

- Use existing shadcn components before adding custom primitives.
- Use lucide-react for icons.
- Use `cn` from `@/lib/utils` for conditional or composed class names. Avoid
  manual string concatenation for Tailwind classes.
- Use lucide-react icons in icon buttons, CTAs, empty states, and small visual
  cues when an appropriate icon exists.
- Prefer `next/image` for raster assets and provide useful `alt` text.
- Form controls should use visible focus states, usually `focus:border-ring`
  and `focus:ring-2 focus:ring-ring/30` or the focus style already provided by
  the shared component.

## Buttons And Links

Use the shared `Button` component for button behavior.

`Link` components from `next/link` must use `cn` with `buttonVariants()` when
they are supposed to look like buttons:

```tsx
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

<Link
  href="/roadmap"
  className={cn(
    buttonVariants({ size: "lg", variant: "dark" }),
    "rounded-full",
  )}
>
  Open roadmap
</Link>;
```

Keep button-like links visually consistent with shared button variants. Add local classes only for layout or small contextual adjustments, such as `rounded-full`, `shadow-none`, or icon hover motion.

## Typography

- Use strong, compact hero headings for landing sections: bold or extra-bold,
  tight line height, and a clear short message.
- Keep body text readable with `text-muted-foreground` on light backgrounds and
  opacity-adjusted white text on dark sections.
- Do not use negative letter spacing or viewport-width-based font scaling.
- Match heading size to the container. Compact panels and cards should not use
  hero-scale text.

## Interaction And Motion

- Motion should be subtle and purposeful: small icon translation on hover,
  opacity transitions, or the existing fade-in utilities.
- Use `transition-colors` or `transition-all` only when it improves interaction
  clarity.
- Disabled and loading states should be explicit and should not cause layout
  shift.

## Accessibility

- Preserve semantic HTML: real buttons for actions, links for navigation,
  headings in order, and labels for form controls.
- Icon-only controls need accessible labels or tooltips.
- Maintain enough contrast, especially on gradient and image backgrounds.
- Keep focus outlines visible for keyboard users.

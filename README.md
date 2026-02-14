_🚨 This project is still under development_

---

# 📚 Phi

## What I Learned

- How to choose between Dynamic and Static rendering or Server and Client components
- How to integrate the application with Google Analytics
- How to deal with authentication and authorization aiming for security and performance
  - In this case, using Magic Link login, JWT in cookies and middleware
- What are the security best practices
  - Such as data validation on the server and implementation of a Data Access Layer (DAL)
- How to implement Stripe for payments
- How to handle cache in Next.js and React Query
- When to fetch via client or server
  - Difference and trade-offs of fetching directly in the component, using React Query, API endpoints or Server Actions
- How to aim for SEO and performance
  - This includes implementing streaming strategies, preventing layout shift, prioritizing Static Site Generation (SSG), etc.

## Overview

Frustrated by the lack of resources to prepare for the **Studienkolleg Aufnahmetest** (the entrance exam of a German university applied to international students), I decided to create a platform that would help students prepare for the exam by providing something I had missed during my studies - somewhere they can recur to when when guidance is what they need.

---

## Index

1. [Platform](#platform)
2. [Pages](#pages)
3. [Tech Stack](#tech-stack)

## Platform

- 🗂️ Large database of exercises accessible by searching and filtering by institution
- 🎬 Paid online course platform with lessons to help students pass the entrance exam of the institution they applied for
  - Utilizing Stripe for payment together with authorization strategies
  - Video streaming and storage strategy using Cloudfront (CDN) and S3 from AWS together with signed URLs
- 📖 Blog for providing guidance for international students
  - At the same time working as an organic traffic channel: improving SEO and authority and establishing relationship
- 📩 Password-free sign in with magic link
  - Process of sending an e-mail to the user containing a link to an API route, which verifies the token sent along and registers the user or logs them in

## Pages

- _/_
- _/exercises_
  - _/exercises/math_
    - _/exercises/math/[id]_
  - _/exercises/c-test_
    - _/exercises/c-test/[id]_
- _/acing-aufnahmetest_
  - _/acing-aufnahmetest/login_
  - _/acing-aufnahmetest/purchase_
    - _/acing-aufnahmetest/purchase/success_
    - _/acing-aufnahmetest/purchase/error_
  - _/acing-aufnahmetest/lessons_
    - _/acing-aufnahmetest/lessons/[slug]_
- _/blog_
  - _/blog/posts_
    - _/blog/posts/[slug]_

## Tech Stack

| Category       | Technology                    |
| -------------- | ----------------------------- |
| Frontend       | Next.js, Tailwind, Shadcn     |
| Data Fetching  | Next.js, React Query          |
| Validation     | Zod                           |
| Database       | PostgreSQL                    |
| ORM            | Prisma                        |
| Payment        | Stripe                        |
| Infrastructure | Vercel, AWS, Neon, Cloudflare |

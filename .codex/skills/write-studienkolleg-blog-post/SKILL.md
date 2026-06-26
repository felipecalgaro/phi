---
name: write-studienkolleg-blog-post
description: "Write and publish English SEO-focused Studienkolleg blog posts for the Phi Next.js project from a user-provided theme. Use when the user asks to create a new blog article/post: draft a 1500-3000 word body-only MDX file in data/blog, generate title/slug/excerpt/readingTime metadata, insert the metadata into the dev database with prisma.post.create(), and mirror the same metadata to the production Post table through Neon MCP."
---

# Write Studienkolleg Blog Post

## Workflow

1. Confirm the user provided a concrete theme. If the theme is missing or too vague, ask for a clearer topic before writing.
2. Work from the Phi repository root. Read `AGENTS.md`, `skill.txt`, and at least one existing file in `data/blog` before writing so style and project rules stay aligned.
3. Convert the theme into a concise ASCII slug:
   - Lowercase letters and digits only.
   - Use hyphens between words.
   - Remove punctuation, accents, stopword clutter, and trailing hyphens.
4. Check for an existing `data/blog/<slug>.mdx`. Also check whether the dev database already has that slug before inserting metadata. If either exists, stop and ask for explicit replacement instructions or a different theme.
5. Draft the post body in English and save it to `data/blog/<slug>.mdx`.
6. Generate metadata:
   - `title`: publishable article title. Do not include this title in the MDX body.
   - `slug`: the filename slug.
   - `excerpt`: 12-20 words that introduce the article clearly.
   - `readingTime`: integer minutes, computed as `ceil((word_count / 1000) * 5)`.
7. Insert the metadata into the dev database using `scripts/create-dev-post.mjs` from this skill.
8. Insert the same metadata into the production Neon `Post` table through the Neon MCP tool/server.
9. Validate the MDX file, metadata, and both database writes before finishing.

## Article Requirements

- Write 1500-3000 words unless the user gives a different range.
- Keep the MDX file body-only: no title line, date, author, frontmatter, imports, or metadata block.
- Use Markdown structure with `##` and `###` sections. Use lists, tables, bold text, and links only when they improve clarity.
- Keep the content practical for international students preparing for Studienkolleg, Aufnahmepruefung, applications, visas, German learning, FSP, or student life in Germany.
- When the theme depends on current rules, deadlines, visa amounts, fees, named institutions, or other changing facts, verify the facts with authoritative sources before writing and include only stable, source-backed claims.
- Avoid keyword stuffing. Prefer direct, helpful explanations and concrete preparation steps.
- Do not create or reference a blog image unless the user asks for one.

## Dev Database Insert

Use the bundled helper from the repository root after saving the MDX file:

```bash
node <skill-dir>/scripts/create-dev-post.mjs --title "<title>" --slug "<slug>" --excerpt "<excerpt>" --reading-time <minutes>
```

The helper loads the repository `.env`, imports the project Prisma client, and calls:

```ts
prisma.post.create({
  data: { title, slug, excerpt, readingTime },
})
```

Never print `DATABASE_URL`, database credentials, cookies, tokens, or signed URLs. If the insert fails because dependencies are missing, run the smallest necessary project install/generate command only with user approval when network or external writes are required.

## Production Neon Insert

Use Neon MCP only after the dev insert succeeds.

1. Confirm a Neon MCP tool/server is available in the current session. If it is not available, stop and tell the user to configure Neon safely before production writes.
2. Use the Neon project named `phi` with project ID `old-voice-07954687`. Identify the production branch/database through Neon MCP. Prefer an explicitly named production/main branch. If multiple plausible targets exist, ask the user to choose.
3. Before writing, query for an existing `Post.slug = <slug>` in production.
4. If no row exists, insert exactly these fields into the production `Post` table. Include `updatedAt = CURRENT_TIMESTAMP`; the production table requires `updatedAt` and does not provide a default.

```sql
INSERT INTO "Post" ("title", "slug", "excerpt", "readingTime", "updatedAt")
VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP);
```

5. If the row exists, do not update it unless the user explicitly requested replacement.
6. Confirm the inserted row by selecting `title`, `slug`, `excerpt`, `readingTime`, `createdAt`, and `updatedAt`.

## Safe Neon MCP Setup Note

If Neon MCP is missing, give the user this setup guidance instead of asking them to paste secrets into chat:

- Prefer OAuth through the Neon MCP remote server or the Neon Postgres Codex plugin when available.
- For Codex CLI, Neon documents `/plugins` -> Neon Postgres -> Add to Codex as the plugin path.
- For MCP-only setup, Neon documents `npx add-mcp https://mcp.neon.tech/mcp -a codex` or `npx add-mcp https://mcp.neon.tech/mcp -a codex -g`.
- For API-key auth, create a scoped Neon API key in the Neon Console and store it in the MCP client's local config or secret store, not in the repo and not in chat.
- After configuration, restart Codex or the MCP client so the Neon tools are available.

## Validation Checklist

- `data/blog/<slug>.mdx` exists and contains body-only MDX.
- The body is English, structured with Markdown headings, and in the requested word range.
- `title`, `slug`, `excerpt`, and `readingTime` are recorded.
- Dev database has exactly one post row for the slug.
- Production Neon database has exactly one post row for the slug, unless Neon MCP was not configured.
- Run `npm run typecheck` and `npm run lint` after creating the MDX and database metadata. Report any command that could not be run.

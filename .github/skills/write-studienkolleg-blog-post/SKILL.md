---
name: write-studienkolleg-blog-post
description: "Write English blog posts about Studienkolleg from a provided theme. Use when creating SEO-focused guidance posts (1000-3000 words) with markdown structure and saving them as .mdx in data/blog with slug-based filenames and body-only content (no title, date, frontmatter, or metadata)."
argument-hint: "theme: <blog topic>; optional tone; length defaults to 1000-3000 words"
---

# Write Studienkolleg Blog Post

## What This Skill Does

Creates a new English blog post about Studienkolleg from a user-provided theme and saves it as an `.mdx` file in `data/blog`.

## When To Use

- User asks for a new Studienkolleg blog post topic
- User provides a theme and expects ready-to-publish text
- Post must be saved as `.mdx` with slug filename
- Content must contain only the article body text

## Inputs

Required:

- Theme for the post

Optional:

- Tone (for example: practical, motivational, formal)
- Approximate length (default: 1000-3000 words)
- Target audience detail (for example: beginners, visa applicants, M-Kurs students)

## Procedure

1. Parse the request and extract the theme.
2. Convert the theme into a slug:
   - Lowercase letters only
   - Use hyphens between words
   - Remove punctuation and accents
   - Keep concise and readable
3. Build the output path as `data/blog/<slug>.mdx`.
4. Write the article in English, focused on Studienkolleg and aligned with the provided theme.
5. Keep article length around 1000-3000 words unless the user explicitly asks for a different range.
6. Structure the content using Markdown features:
   - Use subtitles (for example: `##`, `###`)
   - Use lists where useful
   - Use emphasis (`**bold**`, `*italic*`) when it improves clarity
7. Ensure the content includes only body text:
   - No title line
   - No date
   - No author
   - No frontmatter
   - No metadata block
8. Generate an excerpt of around 12-16 words that introduces the post.
9. Estimate reading time in minutes as an integer using this logic:
   - 5 minutes per 1000 words
   - Formula: `ceil((word_count / 1000) * 5)`
10. Save the file.
11. Validate completion:

- File exists in `data/blog`
- Extension is `.mdx`
- Filename equals the slug
- Content is English body text only
- Content is around 1000-3000 words by default
- Content uses Markdown structure (subtitles and related formatting)
- Excerpt is around 12-16 words and introduces the post
- Reading time is returned as an integer in minutes

## Decision Rules

- If the user gives an explicit slug, use it as filename after sanitizing invalid characters.
- If no explicit slug is given, derive slug from the theme.
- If `data/blog/<slug>.mdx` already exists, stop and ask for a different theme or explicit replacement instruction.
- If theme is missing or too vague, ask for clarification before writing.

## Output Contract

- Primary output: one file at `data/blog/<slug>.mdx`
- File content: English blog body text only, structured in Markdown, around 1000-3000 words by default
- Metadata output to agent: excerpt (around 12-16 words) and reading time in integer minutes
- Final response in chat: created file path, excerpt, reading time (minutes), and a short summary of the article focus

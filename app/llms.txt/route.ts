import prisma from "@/lib/prisma";
import {
  AUTHOR_NAME,
  AUTHOR_URL,
  C_TEST_EXERCISES_DESCRIPTION,
  C_TEST_EXERCISES_PATH,
  COURSE_DESCRIPTION,
  COURSE_PATH,
  EXERCISES_DESCRIPTION,
  EXERCISES_PATH,
  MATH_EXERCISES_DESCRIPTION,
  MATH_EXERCISES_PATH,
  SITE_NAME,
  absoluteUrl,
  blogPostUrl,
  getLastModifiedDate,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

function cleanText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export async function GET() {
  const posts = await prisma.post.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      slug: true,
      title: true,
      excerpt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const lines = [
    `# ${SITE_NAME}`,
    "",
    "Public educational platform for international students preparing for Studienkolleg admission in Germany.",
    "",
    "## Author",
    `- [${AUTHOR_NAME}](${AUTHOR_URL}) - former Studienkolleg student and creator of Guide to Studienkolleg.`,
    "",
    "## Main Public Resources",
    `- [Homepage](${absoluteUrl("/")}) - overview of the platform and admission support.`,
    `- [Author Profile](${AUTHOR_URL}) - profile for Felipe Calgaro, former Studienkolleg student and creator of the site.`,
    `- [Studienkolleg Blog](${absoluteUrl("/blog")}) - guides about Studienkolleg applications, visas, German preparation, and student life.`,
    `- [All Blog Posts](${absoluteUrl("/blog/posts")}) - index of published blog articles.`,
    `- [Aufnahmetest Course](${absoluteUrl(COURSE_PATH)}) - ${COURSE_DESCRIPTION}`,
    `- [Exercises](${absoluteUrl(EXERCISES_PATH)}) - ${EXERCISES_DESCRIPTION}`,
    `- [Math Exercises](${absoluteUrl(MATH_EXERCISES_PATH)}) - ${MATH_EXERCISES_DESCRIPTION}`,
    `- [C-Test Exercises](${absoluteUrl(C_TEST_EXERCISES_PATH)}) - ${C_TEST_EXERCISES_DESCRIPTION}`,
    "",
    "## Blog Posts",
    ...posts.map((post) => {
      const updatedAt = getLastModifiedDate(post.createdAt, post.updatedAt)
        .toISOString()
        .slice(0, 10);
      return `- [${cleanText(post.title)}](${blogPostUrl(post.slug)}) - ${cleanText(post.excerpt)} Last updated: ${updatedAt}.`;
    }),
    "",
    "## Usage Notes",
    "This file summarizes public pages intended for search engines, LLM retrieval systems, and agentic browsing tools.",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

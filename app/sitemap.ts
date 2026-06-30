import prisma from '@/lib/prisma';
import {
  AUTHOR_PATH,
  AUTHOR_IMAGE_PATH,
  BLOG_IMAGE_PATH,
  COURSE_IMAGE_PATH,
  COURSE_PATH,
  C_TEST_EXERCISES_PATH,
  DEFAULT_IMAGE_PATH,
  EXERCISES_IMAGE_PATH,
  EXERCISES_PATH,
  HOME_PATH,
  MATH_EXERCISES_PATH,
  absoluteUrl,
  blogPostImageUrl,
  blogPostPath,
  getLastModifiedDate,
} from '@/lib/seo';
import type { MetadataRoute } from 'next';

const publicRoutes = [
  { path: HOME_PATH, changeFrequency: "monthly", priority: 1, imagePath: DEFAULT_IMAGE_PATH },
  { path: COURSE_PATH, changeFrequency: "weekly", priority: 0.9, imagePath: COURSE_IMAGE_PATH },
  { path: "/blog", changeFrequency: "weekly", priority: 0.9, imagePath: BLOG_IMAGE_PATH },
  { path: "/blog/posts", changeFrequency: "weekly", priority: 0.8, imagePath: BLOG_IMAGE_PATH },
  { path: EXERCISES_PATH, changeFrequency: "monthly", priority: 0.8, imagePath: EXERCISES_IMAGE_PATH },
  { path: MATH_EXERCISES_PATH, changeFrequency: "monthly", priority: 0.7, imagePath: "/passing-exam.png" },
  { path: C_TEST_EXERCISES_PATH, changeFrequency: "monthly", priority: 0.7, imagePath: "/passing-exam.png" },
  { path: AUTHOR_PATH, changeFrequency: "monthly", priority: 0.6, imagePath: AUTHOR_IMAGE_PATH },
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await prisma.post.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      slug: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = publicRoutes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    images: [absoluteUrl(route.imagePath)],
  }));

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: absoluteUrl(blogPostPath(post.slug)),
    lastModified: getLastModifiedDate(post.createdAt, post.updatedAt),
    changeFrequency: "monthly",
    priority: 0.8,
    images: [blogPostImageUrl(post.slug)],
  }));

  return [...staticEntries, ...postEntries];
}

import prisma from '@/lib/prisma';
import {
  AUTHOR_NAME,
  AUTHOR_PATH,
  AUTHOR_URL,
  BLOG_KEYWORDS,
  SITE_NAME,
  SITE_ORIGIN,
  absoluteUrl,
  blogPostImageAlt,
  blogPostImagePath,
  blogPostImageUrl,
  blogPostPath,
  blogPostUrl,
  getLastModifiedDate,
} from '@/lib/seo';
import { ArrowLeft, Calendar, Clock, UserRound } from 'lucide-react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { cache } from 'react';

export async function generateStaticParams() {
  return await prisma.post.findMany({
    select: { slug: true }
  })
}

type PostParams = Promise<{ slug: string }>

export const dynamicParams = false

const getPost = cache(async (slug: string) => {
  return prisma.post.findUniqueOrThrow({
    where: { slug },
  })
});

export async function generateMetadata(
  { params }: { params: PostParams },
): Promise<Metadata> {
  const { slug } = await params;

  const post = await getPost(slug);
  const postUrl = blogPostUrl(post.slug);
  const imageUrl = blogPostImageUrl(post.slug);
  const imageAlt = blogPostImageAlt(post.title);
  const modifiedAt = getLastModifiedDate(post.createdAt, post.updatedAt);

  return {
    title: post.title,
    description: post.excerpt,
    authors: [{ name: AUTHOR_NAME, url: AUTHOR_URL }],
    keywords: BLOG_KEYWORDS,
    alternates: {
      canonical: blogPostPath(post.slug),
    },
    openGraph: {
      type: "article",
      siteName: SITE_NAME,
      title: post.title,
      description: post.excerpt,
      url: postUrl,
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: modifiedAt.toISOString(),
      authors: [AUTHOR_URL],
      images: [
        {
          url: imageUrl,
          width: 1050,
          height: 600,
          alt: imageAlt,
        },
      ],
    },
  }
}


export default async function Post({ params }: { params: PostParams }) {
  const { slug } = await params;

  const post = await getPost(slug);

  const { default: PostContent } = await import(`@/data/blog/${slug}.mdx`)
  const postUrl = blogPostUrl(post.slug);
  const imageUrl = blogPostImageUrl(post.slug);
  const imageAlt = blogPostImageAlt(post.title);
  const modifiedAt = getLastModifiedDate(post.createdAt, post.updatedAt);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: [imageUrl],
    datePublished: post.createdAt.toISOString(),
    dateModified: modifiedAt.toISOString(),
    author: {
      "@type": "Person",
      name: AUTHOR_NAME,
      url: AUTHOR_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_ORIGIN,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
    isPartOf: {
      "@type": "Blog",
      name: "Studienkolleg Blog",
      url: absoluteUrl("/blog"),
    },
    inLanguage: "en",
  };

  return (
    <div className="min-h-screen pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <nav className="border-b border-border w-full flex justify-center items-center">
        <div className="max-w-4xl w-full flex justify-start items-center px-4 sm:px-6 lg:px-8 py-6 h-20">
          <Link
            href="/blog/posts"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Posts
          </Link>
        </div>
      </nav>
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-32 prose">
        <header className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {post.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {post.readingTime}min
            </div>
            <Link href={AUTHOR_PATH} className="flex items-center gap-2 hover:text-foreground transition-colors">
              <UserRound className="w-4 h-4" />
              By {AUTHOR_NAME}
            </Link>
          </div>
        </header>

        <div className="mb-12">
          <Image src={blogPostImagePath(post.slug)} alt={imageAlt} width={1050} height={600} loading='eager' className="rounded-xs object-cover w-full" />
        </div>

        <PostContent />
      </article>
    </div>
  );
}

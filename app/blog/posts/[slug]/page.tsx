import prisma from '@/lib/prisma';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export async function generateStaticParams() {
  return await prisma.post.findMany({
    select: { slug: true }
  })
}

export const dynamicParams = false

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const post = await prisma.post.findUniqueOrThrow({
    where: { slug },
  })

  const { default: PostContent } = await import(`@/data/blog/${slug}.mdx`)

  return (
    <div className="min-h-screen pb-24">
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
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {post.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {post.readingTime}min
            </div>
          </div>
        </header>

        <div className="mb-12">
          <Image src={`/blog-images/${post.slug}.png`} alt={post.slug} width={1050} height={600} className="rounded-xs object-cover w-full" />
        </div>

        <PostContent />
      </article>
    </div>
  );
}
import { PostCard } from '@/components/blog/post-card';
import prisma from '@/lib/prisma';
import Link from 'next/link';

export default async function Posts() {
  const posts = await prisma.post.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      slug: true,
      title: true,
      createdAt: true,
      readingTime: true,
      excerpt: true,
    },
  });

  return (
    <div className="pb-24">
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-foreground">
              STK Blog
            </p>
            <Link
              href="/blog"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </Link>
          </div>
        </div>
      </nav>
      <section className="py-20 xs:px-12 px-3">
        <div className="flex justify-center items-center flex-col">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Latest Posts
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center items-center">
            {posts.map((post) => (
              <PostCard key={post.id} readingTime={post.readingTime} createdAt={post.createdAt} excerpt={post.excerpt} slug={post.slug} title={post.title} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
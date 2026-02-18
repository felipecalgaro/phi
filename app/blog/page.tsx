import { PostCard } from '@/components/blog/post-card';
import { buttonVariants } from '@/components/ui/button';
import prisma from '@/lib/prisma';
import { cn } from '@/lib/utils';
import { ArrowRight, Navigation } from 'lucide-react';
import Link from 'next/link';

export default async function Home() {
  const latestPosts = await prisma.post.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    take: 3,
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
    <>
      <div className="flex flex-col justify-center items-center w-full">
        <header className="w-full flex justify-between items-center max-w-7xl min-h-16 gap-x-20 gap-y-4 flex-wrap mt-6 xs:px-20 px-10">
          <Link href="/" className="flex items-center lg:gap-4 gap-2 font-bold lg:text-xl text-lg md:w-auto w-full">
            <Navigation className="lg:size-6 size-5 shrink-0" />
            <span className='whitespace-nowrap'>Guide to Studienkolleg</span>
          </Link>

          <nav className="flex md:flex-row flex-col md:items-center items-start gap-x-4 gap-y-2 flex-wrap">
            <Link href="/exercises" className={cn(buttonVariants(), "text-foreground/80 hover:text-foreground hover:bg-foreground/5 bg-transparent border border-foreground/20")}>Exercises</Link>
            <Link href='/acing-aufnahmetest' className={cn(buttonVariants(), 'text-accent-foreground')}>
              Acing Aufnahmetest
            </Link>
          </nav>
        </header>
        <section className="pt-40 text-center flex justify-center items-center flex-col w-full">
          <div className="max-w-4xl flex justify-center items-center flex-col gap-6 xs:px-8 px-4">
            <h1 className="text-4xl xs:text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
              Studienkolleg Blog
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Your guide to Studienkolleg in Germany 🇩🇪
            </p>
            <Link href="/blog/posts" className={cn(buttonVariants({ size: 'lg' }), "h-12 has-[>svg]:px-8 mt-12 group")}>
              Explore Posts
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className='bg-primary w-full relative flex justify-between items-center flex-col mt-52 py-24 xs:px-12 px-3 gap-24'>
            <p className="text-2xl text-foreground font-medium">
              Everything you need to know about studying in Studienkolleg
            </p>
            <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 justify-center items-center gap-x-8 gap-y-8 whitespace-nowrap">
              {latestPosts.map((post) => (
                <PostCard key={post.id} readingTime={post.readingTime} createdAt={post.createdAt} excerpt={post.excerpt} slug={post.slug} title={post.title} />
              ))}
              <div className='min-h-32 size-full flex justify-center items-center lg:hidden'>
                <p>More Posts</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

import { prisma } from '@/lib/prisma';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

async function generateStaticParams() {
  return await prisma.post.findMany({
    select: { slug: true }
  })
}

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const post = await prisma.post.findUnique({
    where: { slug },
  });

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/blog/posts"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all posts
          </Link>
        </div>
      </nav>
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
              12min
            </div>
          </div>
        </header>

        <div className="mb-12">
          <Image src={post.image} alt={post.title} width={1050} height={600} className="rounded-xs object-cover w-full" />
        </div>

        <div className="prose prose-lg max-w-none">
          {post.content.split('\n\n').map((paragraph, index) => {
            if (paragraph.startsWith('## ')) {
              return (
                <h2 key={index} className="text-2xl font-bold text-foreground mt-8 mb-4">
                  {paragraph.replace('## ', '')}
                </h2>
              );
            } else if (paragraph.startsWith('### ')) {
              return (
                <h3 key={index} className="text-xl font-semibold text-foreground mt-6 mb-3">
                  {paragraph.replace('### ', '')}
                </h3>
              );
            } else if (paragraph.startsWith('- ')) {
              const items = paragraph.split('\n');
              return (
                <ul key={index} className="list-disc list-inside space-y-2 my-4 text-foreground/90">
                  {items.map((item, i) => (
                    <li key={i}>{item.replace('- ', '')}</li>
                  ))}
                </ul>
              );
            } else if (paragraph.match(/^\d+\./)) {
              const items = paragraph.split('\n');
              return (
                <ol key={index} className="list-decimal list-inside space-y-2 my-4 text-foreground/90">
                  {items.map((item, i) => (
                    <li key={i}>{item.replace(/^\d+\.\s*/, '')}</li>
                  ))}
                </ol>
              );
            } else if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
              return (
                <p key={index} className="font-semibold text-foreground my-4">
                  {paragraph.replace(/\*\*/g, '')}
                </p>
              );
            } else {
              return (
                <p key={index} className="text-foreground/90 leading-relaxed my-4">
                  {paragraph}
                </p>
              );
            }
          })}
        </div>
      </article>
    </div>
  );
}
import { Clock, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';
import { prisma } from '@/lib/prisma';

interface PostsSectionProps {
  limit?: number;
}

export async function PostsSection({ limit }: PostsSectionProps) {
  const posts = await prisma.post.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  });

  return (
    <section className="py-20 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Latest Posts
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about studying in Studienkolleg
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link href={`/blog/posts/${post.slug}`} key={post.id} className="h-full group">
              <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full flex flex-col">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="size-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{Math.ceil(post.content.split(' ').length / 200)} min</span>
                  </div>
                  <CardTitle className="text-2xl leading-tight group-hover:text-primary transition-colors">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <CardDescription className="text-base leading-relaxed mb-4 flex-1 text-ellipsis overflow-hidden">
                    {post.content}
                  </CardDescription>
                  <div className="flex items-center text-sm text-muted-foreground pt-4 border-t border-border">
                    <Calendar className="w-4 h-4 mr-2" />
                    {post.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
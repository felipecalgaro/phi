import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Calendar, Clock } from 'lucide-react';

interface PostCardProps {
  slug: string;
  title: string;
  readingTime: number;
  createdAt: Date;
  excerpt: string;
}

export function PostCard({ slug, title, readingTime, createdAt, excerpt }: PostCardProps) {
  return (
    <Link href={`/blog/posts/${slug}`} className="min-h-80 max-w-90 size-full">
      <Card className="hover:shadow-lg transition-shadow h-full flex flex-col text-start">
        <CardHeader>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="size-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{readingTime} min</span>
          </div>
          <CardTitle className="text-2xl leading-tight whitespace-normal">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between">
          <CardDescription className="max-h-20 h-full text-base leading-relaxed mb-4 flex-1 line-clamp-3 whitespace-normal">
            {excerpt}
          </CardDescription>
          <div className="flex items-center text-sm text-muted-foreground pt-4 border-t border-border">
            <Calendar className="w-4 h-4 mr-2" />
            {createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
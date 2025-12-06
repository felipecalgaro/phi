import { Clock, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';

const mockPosts = [
  {
    id: 1,
    title: "How to Pass the Aufnahmeprüfung: A Complete Guide",
    excerpt: "Master the entrance exam with proven strategies, study tips, and insider advice from successful students who made it through.",
    date: "March 15, 2024",
    category: "Exam Prep",
    readTime: "8 min read"
  },
  {
    id: 2,
    title: "A Day in the Life at Studienkolleg",
    excerpt: "Discover what daily life really looks like for international students in Germany's preparatory courses, from classes to cultural adaptation.",
    date: "March 10, 2024",
    category: "Student Life",
    readTime: "6 min read"
  },
  {
    id: 3,
    title: "Career Prospects: Salaries for International Graduates",
    excerpt: "Explore realistic salary expectations and career opportunities for international students after graduation from German universities.",
    date: "March 5, 2024",
    category: "Career",
    readTime: "10 min read"
  },
  {
    id: 4,
    title: "Choosing Your Schwerpunkt: T-Kurs vs M-Kurs",
    excerpt: "Navigate the crucial decision between technical and medical focus courses with insights on curriculum, difficulty, and future paths.",
    date: "February 28, 2024",
    category: "Guidance",
    readTime: "7 min read"
  },
  {
    id: 5,
    title: "German Language Learning: From Zero to B2",
    excerpt: "A realistic roadmap for achieving the German language proficiency needed for Studienkolleg admission and academic success.",
    date: "February 22, 2024",
    category: "Language",
    readTime: "12 min read"
  },
  {
    id: 6,
    title: "Managing Finances as a Studienkolleg Student",
    excerpt: "Practical tips on budgeting, part-time work regulations, and financial aid options for international students in Germany.",
    date: "February 15, 2024",
    category: "Finance",
    readTime: "9 min read"
  }
];

interface PostsSectionProps {
  limit?: number;
}

export function PostsSection({ limit }: PostsSectionProps) {
  const visiblePosts = limit ? mockPosts.slice(0, limit) : mockPosts;

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
          {visiblePosts.map((post) => (
            <Link href={`/posts/${post.id}`} key={post.id} className="h-full group">
              <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full flex flex-col">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="size-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{post.readTime}</span>
                  </div>
                  <CardTitle className="text-2xl leading-tight group-hover:text-primary transition-colors">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <CardDescription className="text-base leading-relaxed mb-4 flex-1">
                    {post.excerpt}
                  </CardDescription>
                  <div className="flex items-center text-sm text-muted-foreground pt-4 border-t border-border">
                    <Calendar className="w-4 h-4 mr-2" />
                    {post.date}
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
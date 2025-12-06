import { PostsSection } from '@/components/blog/posts-section';
import { Home } from "lucide-react";
import Link from 'next/link';

export default function Posts() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-foreground hover:text-primary transition-colors">
              PhiBlog
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
          </div>
        </div>
      </nav>
      <PostsSection />
    </div>
  );
};
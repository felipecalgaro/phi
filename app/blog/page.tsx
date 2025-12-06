import { registerEmail } from '@/actions/blog/register-email';
import { PostsSection } from '@/components/blog/posts-section';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ArrowRight, Mail } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <div className="min-h-screen bg-background">
        <section className="py-40 px-8 text-center border-b border-border flex justify-center items-center">
          <div className="max-w-4xl flex justify-center items-center flex-col gap-6">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground tracking-tight">
              PhiBlog
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Your guide to Studienkolleg in Germany 🇩🇪
            </p>
            <Link href="/posts" className={cn(buttonVariants({ size: 'lg' }), "h-12 has-[>svg]:px-8 mt-12")}>
              Explore Posts
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </section>
        <section className="py-16 px-8 bg-secondary/30">
          <div className="max-w-2xl mx-auto text-center">
            <Mail className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Stay Updated
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Get notified when we publish new posts about Studienkolleg
            </p>
            <form action={registerEmail} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="your@email.com"
                className="flex-1 min-h-12 text-base"
                required
              />
              <Button type="submit" size="lg" className="h-12 px-8">
                Subscribe
              </Button>
            </form>
          </div>
        </section>
        <PostsSection limit={3} />
      </div>
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-foreground font-semibold text-lg mb-2">PhiBlog</p>
          <p className="text-muted-foreground text-sm mb-8">
            © {new Date().getFullYear()} PhiBlog. Empowering students on their German education journey.
          </p>
          <div className='flex justify-center items-center gap-x-4 gap-y-2 sm:flex-row flex-col'>
            <Link href="/privacy" className="text-sm text-muted-foreground">
              Privacy Policy
            </Link>
            <p className='text-muted-foreground sm:block hidden'>·</p>
            <Link href="/terms" className="text-sm text-muted-foreground">
              Terms of Service
            </Link>
            <p className='text-muted-foreground sm:block hidden'>·</p>
            <Link href="/contact" className="text-sm text-muted-foreground">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}

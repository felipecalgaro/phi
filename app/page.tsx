import { Header } from '@/components/header';
import { QuestionsCard } from '@/components/questions-card';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DEFAULT_IMAGE_PATH,
  HOME_DESCRIPTION,
  HOME_PATH,
  SITE_KEYWORDS,
  SITE_NAME,
  createJsonLdGraph,
  createOrganizationJsonLd,
  createPageMetadata,
  createWebPageJsonLd,
  createWebSiteJsonLd,
  stringifyJsonLd,
} from '@/lib/seo';
import { ArrowRight, Sparkles } from "lucide-react";
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  ...createPageMetadata({
    title: SITE_NAME,
    description: HOME_DESCRIPTION,
    path: HOME_PATH,
    keywords: SITE_KEYWORDS,
    image: {
      path: DEFAULT_IMAGE_PATH,
      alt: "Guide to Studienkolleg platform preview",
    },
  }),
  title: {
    absolute: SITE_NAME,
  },
};

export default function Home() {
  const jsonLd = createJsonLdGraph([
    createOrganizationJsonLd(),
    createWebSiteJsonLd(),
    createWebPageJsonLd({
      path: HOME_PATH,
      title: SITE_NAME,
      description: HOME_DESCRIPTION,
      imagePath: DEFAULT_IMAGE_PATH,
    }),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: stringifyJsonLd(jsonLd),
        }}
      />
      <Header />
      <section className="hero-background relative flex xl:flex-nowrap flex-wrap items-center justify-center sm:px-8 px-4 pb-24 pt-24 lg:px-12 sm:gap-20 gap-12 min-h-screen">
        <div className="text-center lg:max-w-3xl max-w-5xl shrink w-min">
          <Badge variant="secondary" className="mb-5 rounded-full border-border bg-card px-4 py-1.5 text-xs font-medium text-foreground">
            <Sparkles className="mr-1.5 h-3 w-3" /> Personalized in 2 min
          </Badge>
          <h1 className="mb-10 sm:text-6xl xs:text-5xl text-4xl font-extrabold leading-[0.95] xl:text-7xl">
            Roadmap to <span className="text-gradient-accent">Studienkolleg</span>, personalized.
          </h1>
          <p className="mx-auto max-w-lg text-lg text-muted-foreground">
            Answer a few questions and get a visual, step-by-step roadmap to study in a Studienkolleg in Germany.
          </p>
        </div>
        <QuestionsCard />
      </section>
      <div className="w-full h-100 gradient-separator" />
      <div className="bg-background">
        <section className="px-6 py-24 lg:px-12">
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-x-12 gap-y-16 sm:flex-nowrap flex-wrap">
            <div className="shrink-0 rounded-3xl border border-border bg-card p-3 shadow-(--shadow-soft)">
              <Image src='/aat-preview.png' alt="Acing Aufnahmetest preview" width={615} height={525} className='lg:w-md md:w-sm w-xs' />
            </div>

            <div className="max-w-lg space-y-6 border-l-2 border-gray-200 pl-6 order-2">
              <h2 className="sm:text-4xl text-3xl font-black lg:text-5xl text-foreground">
                Acing Aufnahmetest
              </h2>
              <p className="sm:text-xl text-lg leading-relaxed text-muted-foreground">
                Comprehensive course designed to help you pass your Studienkolleg entrance exam with expert guidance and practice resources.
              </p>
              <Link href="/acing-aufnahmetest" className={cn(buttonVariants({ size: 'lg' }), "group h-12 rounded-full bg-foreground px-6 text-background shadow-none hover:bg-foreground/90")}>
                View Course
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>

        <div className="mx-auto h-px max-w-6xl bg-linear-to-r from-transparent via-border to-transparent" />

        <section className="px-6 py-24 lg:px-12">
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-x-12 gap-y-16 sm:flex-nowrap flex-wrap">
            <div className="shrink-0 rounded-3xl border border-border bg-card p-3 shadow-(--shadow-soft) order-2">
              <Image src='/book-germany.png' alt="Book about Germany" width={887} height={863} className='lg:w-md md:w-sm w-xs' />
            </div>

            <div className="max-w-lg space-y-6 border-l-2 border-gray-200 pl-6">
              <h2 className="sm:text-4xl text-3xl font-black lg:text-5xl text-foreground">
                Aufnahmetest Exercises
              </h2>
              <p className="sm:text-xl text-lg leading-relaxed text-muted-foreground">
                Access a variety of math exercises and C-Tests from real Aufnahmetests to help you in your preparation.
              </p>
              <Link href="/exercises" className={cn(buttonVariants({ size: 'lg' }), "group h-12 rounded-full bg-foreground px-6 text-background shadow-none hover:bg-foreground/90")}>
                View Exercises
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>

        <div className="mx-auto h-px max-w-6xl bg-linear-to-r from-transparent via-border to-transparent" />

        <section className="px-6 py-24 lg:px-12">
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-x-12 gap-y-16 sm:flex-nowrap flex-wrap">
            <div className="shrink-0 rounded-3xl border border-border bg-card p-3 shadow-(--shadow-soft)">
              <Image src='/blog-posts.png' alt="Blog Posts" width={800} height={743} className='lg:w-md md:w-sm w-xs rounded-2xl' />
            </div>

            <div className="max-w-lg space-y-6 border-l-2 border-gray-200 pl-6 order-2">
              <h2 className="sm:text-4xl text-3xl font-black lg:text-5xl text-foreground">
                Studienkolleg Blog
              </h2>
              <p className="sm:text-xl text-lg leading-relaxed text-muted-foreground">
                Here you will find tutorials, tips, common misunderstandings, and every information you need for Studienkolleg and the admission process.
              </p>
              <Link href="/blog" className={cn(buttonVariants({ size: 'lg' }), "group h-12 rounded-full bg-foreground px-6 text-background shadow-none hover:bg-foreground/90")}>
                View Blog
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

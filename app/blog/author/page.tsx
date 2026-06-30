import {
  AUTHOR_NAME,
  AUTHOR_PATH,
  AUTHOR_URL,
  BLOG_DESCRIPTION,
  SITE_NAME,
  createBreadcrumbJsonLd,
  createJsonLdGraph,
  createOrganizationJsonLd,
  createWebPageJsonLd,
  createWebSiteJsonLd,
  stringifyJsonLd,
} from '@/lib/seo';
import { ArrowLeft, Navigation } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

const authorDescription =
  "Felipe Calgaro is a former Studienkolleg student and the creator of Guide to Studienkolleg.";

export const metadata: Metadata = {
  title: AUTHOR_NAME,
  description: authorDescription,
  alternates: {
    canonical: AUTHOR_PATH,
  },
  openGraph: {
    type: "profile",
    siteName: SITE_NAME,
    title: AUTHOR_NAME,
    description: authorDescription,
    url: AUTHOR_PATH,
  },
};

export default function FelipeCalgaroAuthorPage() {
  const jsonLd = createJsonLdGraph([
    createOrganizationJsonLd(),
    createWebSiteJsonLd(),
    createWebPageJsonLd({
      path: AUTHOR_PATH,
      title: AUTHOR_NAME,
      description: authorDescription,
    }),
    createBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blog" },
      { name: AUTHOR_NAME, path: AUTHOR_PATH },
    ]),
    {
      "@type": "Person",
      "@id": AUTHOR_URL,
      name: AUTHOR_NAME,
      url: AUTHOR_URL,
      description: authorDescription,
      knowsAbout: [
        "Studienkolleg",
        "Aufnahmetest preparation",
        "German university admission",
        "Studying in Germany",
      ],
    },
  ]);

  return (
    <main className="min-h-screen pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: stringifyJsonLd(jsonLd),
        }}
      />
      <nav className="border-b border-border">
        <div className="mx-auto flex h-20 max-w-4xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Navigation className="size-5 shrink-0" />
            <span>Guide to Studienkolleg</span>
          </Link>
          <Link
            href="/blog/posts"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Posts
          </Link>
        </div>
      </nav>

      <article className="mx-auto max-w-4xl px-4 pb-32 pt-16 sm:px-6 lg:px-8">
        <p className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Author
        </p>
        <h1 className="text-4xl font-bold leading-tight text-foreground sm:text-5xl">
          {AUTHOR_NAME}
        </h1>
        <div className="mt-8 max-w-2xl space-y-5 text-lg leading-8 text-muted-foreground">
          <p>
            Felipe Calgaro is a former Studienkolleg student and the creator of{" "}
            <span className="text-foreground">{SITE_NAME}</span>.
          </p>
          <p>
            He writes practical guides for international students who are
            preparing their Studienkolleg applications, German language plan,
            visa documents, and Aufnahmetest preparation.
          </p>
          <p>{BLOG_DESCRIPTION}</p>
        </div>
      </article>
    </main>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from 'next/script';
import { Suspense } from 'react';
import { AnalyticsPageTracker } from '@/components/analytics-page-tracker';
import Link from 'next/link';
import { Navigation } from 'lucide-react';
import { Toaster } from 'sonner';
import QueryProvider from '@/components/query-provider';
import {
  AUTHOR_NAME,
  AUTHOR_URL,
  DEFAULT_IMAGE_PATH,
  HOME_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_URL,
} from '@/lib/seo';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  applicationName: SITE_NAME,
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: HOME_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  authors: [{ name: AUTHOR_NAME, url: AUTHOR_URL }],
  creator: AUTHOR_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: HOME_DESCRIPTION,
    url: "/",
    images: [
      {
        url: DEFAULT_IMAGE_PATH,
        alt: "Guide to Studienkolleg platform preview",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased`}
      >
        <QueryProvider>
          {children}
          <footer className="bg-foreground text-background pt-18 pb-8 px-6 lg:px-12 flex flex-col justify-center items-center">
            <div className="flex justify-between items-start max-w-2xl gap-8 w-full flex-wrap">
              <div className="space-y-4">
                <Link href="/" className="flex items-center sm:gap-4 gap-2 font-bold sm:text-xl text-lg">
                  <Navigation className="sm:size-6 size-5" />
                  <span>Guide to Studienkolleg</span>
                </Link>
                <p className="text-background/70 text-sm leading-relaxed">
                  Your trusted companion on your admission journey.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Quick Links</h3>
                <nav className="flex flex-col gap-2">
                  <Link href="/acing-aufnahmetest" className="text-background/70 hover:text-background transition-colors text-sm">
                    Acing Aufnahmetest
                  </Link>
                  <Link href="/roadmap" className="text-background/70 hover:text-background transition-colors text-sm">
                    Roadmap
                  </Link>
                  <Link href="/exercises" className="text-background/70 hover:text-background transition-colors text-sm">
                    Exercises
                  </Link>
                  <Link href="/blog" className="text-background/70 hover:text-background transition-colors text-sm">
                    Blog
                  </Link>
                  <Link href="/terms" className="text-background/70 hover:text-background transition-colors text-sm">
                    Terms of Service
                  </Link>
                  <Link href="/privacy" className="text-background/70 hover:text-background transition-colors text-sm">
                    Privacy Policy
                  </Link>
                  <Link href="/" className="text-background/70 hover:text-background transition-colors text-sm">
                    Home
                  </Link>
                </nav>
              </div>
            </div>
            <div className="mt-10 pt-8 border-t border-background/10 text-center text-background/50 text-sm max-w-4xl w-full">
              © {new Date().getFullYear()} Guide to Studienkolleg. All rights reserved.
            </div>
          </footer>
          <Toaster richColors />
        </QueryProvider>
      </body>
      <Script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_TRACKING_ID}`} />
      <Script id='google-analytics' strategy="afterInteractive">
        {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', '${process.env.NEXT_PUBLIC_GA_TRACKING_ID}', {send_page_view: false});
        `}
      </Script>
      <Suspense>
        <AnalyticsPageTracker />
      </Suspense>
    </html>
  );
}

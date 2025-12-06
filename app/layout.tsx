import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from 'next/script';
import { Suspense } from 'react';
import { AnalyticsPageTracker } from '@/components/analytics-page-tracker';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Your Guide to STK",
  description: "Tailor-made support from a former Studienkolleg student to your admission.",
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
        {children}
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

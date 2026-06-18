import { env } from "@/lib/env";
import type { Metadata } from "next";
import Link from "next/link";

const contactEmail = `contact@${env.NEXT_PUBLIC_EMAIL_DOMAIN}`;

const sections = [
  {
    title: "1. Information we collect",
    items: [
      "We collect information you choose to share with us, such as your name, email address, and any messages you send through forms or support requests.",
      "If you buy a paid product, we may receive purchase and transaction details from our payment processor, but we do not intentionally collect full card details ourselves.",
      "We may also collect technical data such as device type, browser information, IP address, approximate location, and page usage signals.",
    ],
  },
  {
    title: "2. How we use information",
    items: [
      "We use the data we collect to provide the site, deliver the course, answer questions, process purchases, and keep your account working properly.",
      "We also use information to improve content, understand which pages are useful, detect abuse, and maintain security.",
      "If you join our email list, we may send product updates, reminders, study tips, and other marketing emails related to Guide to Studienkolleg.",
    ],
  },
  {
    title: "3. Email marketing",
    items: [
      "We may use your email address to send marketing and product emails when you subscribe, create an account, purchase access, or otherwise opt in where allowed.",
      "You can unsubscribe from marketing emails at any time by using the link in the message or by contacting us directly.",
      "Even if you unsubscribe from marketing, we may still send important service emails about your account, purchases, or security.",
    ],
  },
  {
    title: "4. Analytics and tracking",
    items: [
      "Guide to Studienkolleg may use analytics tools, such as Google Analytics or similar services, to understand traffic patterns and improve the experience.",
      "These tools may use cookies or similar technologies to measure visits, page views, and interactions.",
      "You can limit tracking through browser settings, privacy extensions, or other tools that block analytics scripts and cookies.",
    ],
  },
  {
    title: "5. Sharing and retention",
    items: [
      "We share data only with service providers that help us run the platform, such as hosting, email delivery, analytics, payment processing, or security tools.",
      "We do not sell your personal information.",
      "We keep personal data only for as long as needed to provide the service, meet legal obligations, resolve disputes, and enforce our agreements.",
    ],
  },
  {
    title: "6. Your rights",
    items: [
      "Depending on where you live, you may have rights to access, correct, delete, or object to certain processing of your personal data.",
      "You may also have the right to withdraw consent where processing is based on consent.",
      "To make a request, contact us using the address below and we will respond as required by applicable law.",
    ],
  },
  {
    title: "7. Independent platform notice and contact",
    items: [
      "Guide to Studienkolleg is an independent study platform and is not an official company, school, Studienkolleg, or government authority.",
      `If you have questions about this Privacy Policy or your data, email ${contactEmail}.`,
      "We may update this policy from time to time, and the latest version will always appear on this page.",
    ],
  },
];

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Guide to Studienkolleg, including email collection, analytics, and marketing emails.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto max-w-3xl px-6 py-16 lg:py-20">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Privacy Policy</h1>
          <p className="text-lg leading-8 text-muted-foreground">
            This policy explains what Guide to Studienkolleg collects, how we use it, and the choices you have when you use the platform or join our email list.
          </p>
        </div>

        <div className="mt-12 space-y-10">
          {sections.map((section) => (
            <article key={section.title} className="space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">{section.title}</h2>
              <div className="space-y-4 text-base leading-7 text-muted-foreground">
                {section.items.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </article>
          ))}
        </div>

        <p className="mt-12 text-base leading-7 text-muted-foreground">
          For privacy requests, email{" "}
          <Link href={`mailto:${contactEmail}`} className="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors">
            {contactEmail}
          </Link>
          .
        </p>
      </section>
    </main>
  );
}

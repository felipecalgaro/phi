import { env } from "@/lib/env";
import type { Metadata } from "next";
import Link from "next/link";

const contactEmail = `contact@${env.NEXT_PUBLIC_EMAIL_DOMAIN}`;

const sections = [
  {
    title: "1. Scope and acceptance",
    items: [
      "Guide to Studienkolleg is an independent online study platform created to help international students prepare for Studienkolleg and related admissions steps.",
      "Guide to Studienkolleg is not an official company of any school, Studienkolleg, university, ministry, immigration office, embassy, or government authority.",
      "By using the site, reading the content, or buying the course, you agree to these Terms and to any additional notices shown at checkout or inside the product.",
    ],
  },
  {
    title: "2. Paid course and purchases",
    items: [
      "Guide to Studienkolleg may offer a paid course, digital lessons, and related study materials.",
      "Prices, availability, access periods, and purchase conditions are shown before checkout and may change over time.",
      "When you buy access, you are responsible for providing accurate billing details and for keeping your account secure.",
      "Unless required by law or stated otherwise at the time of purchase, payments are generally final once access to digital content has started.",
    ],
  },
  {
    title: "3. User responsibilities",
    items: [
      "Use Guide to Studienkolleg only for lawful purposes and in a way that does not interfere with the experience of other users or the operation of the platform.",
      "Do not copy, scrape, resell, reverse engineer, or distribute course materials without written permission.",
      "Do not submit false information, attempt unauthorized access, or use the service in a way that could damage or disrupt the platform.",
      "You remain responsible for your own study choices, document preparation, application submissions, and compliance with the rules of any school or authority you apply to.",
    ],
  },
  {
    title: "4. Intellectual property",
    items: [
      "All text, design, branding, exercises, videos, graphics, and other materials on Guide to Studienkolleg are protected by intellectual property rights unless we say otherwise.",
      "You receive a limited, personal, non-transferable license to access the content for your own study use.",
      "Any third-party names, logos, or references belong to their respective owners and are used for identification or descriptive purposes only.",
    ],
  },
  {
    title: "5. Educational disclaimer",
    items: [
      "Guide to Studienkolleg provides educational guidance and study resources, not legal, immigration, or official admissions advice.",
      "We try to keep information accurate and current, but rules, deadlines, exams, and requirements can change without notice.",
      "You should verify important information with the relevant school, institution, or authority before relying on it.",
    ],
  },
  {
    title: "6. Limitation of liability",
    items: [
      "To the fullest extent allowed by law, Guide to Studienkolleg is not liable for indirect, incidental, special, or consequential damages arising from your use of the platform.",
      "This includes loss of opportunity, missed deadlines, application outcomes, study results, or reliance on educational content.",
      "If liability cannot be fully excluded, it is limited to the amount you paid for the paid service giving rise to the claim, or the lowest amount allowed by law.",
    ],
  },
  {
    title: "7. Updates and contact",
    items: [
      "We may update these Terms from time to time. The latest version applies when it is posted on this page.",
      "If you continue using Guide to Studienkolleg after an update becomes effective, that continued use counts as acceptance of the revised Terms.",
      `Questions about these Terms can be sent to ${contactEmail}.`,
    ],
  },
];

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Guide to Studienkolleg, the independent Studienkolleg study platform.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto max-w-3xl px-6 py-16 lg:py-20">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Terms of Service</h1>
          <p className="text-lg leading-8 text-muted-foreground">
            These Terms explain how Guide to Studienkolleg works, what you get when you buy access, and the boundaries of our educational service.
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
          If you have questions about these Terms or your purchase, contact us at{" "}
          <Link href={`mailto:${contactEmail}`} className="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors">
            {contactEmail}
          </Link>
          .
        </p>
      </section>
    </main>
  );
}

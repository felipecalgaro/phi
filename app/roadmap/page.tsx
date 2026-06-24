import { ArrowRight, Sparkles, Users, BookOpen, MessageCircle } from "lucide-react";
import { Header } from "@/components/header";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfettiOnFirstVisit } from "@/components/roadmap/confetti-on-first-visit";
import { RoadmapStepDialog } from "@/components/roadmap/roadmap-step-dialog";
import { verifySession } from '@/lib/dal';
import prisma from '@/lib/prisma';
import { Roadmap } from '@/lib/roadmap';
import { cn } from '@/lib/utils';
import { redirect } from 'next/navigation';
import Link from 'next/link';

async function getRoadmap() {
  const { isAuthenticated, userId } = await verifySession();

  if (!isAuthenticated) {
    throw new Error("Unauthorized. Please log in and try again.");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      countryOfHighschool: true,
      citizenships: true,
      plannedStudienkollegs: true,
    },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  if (!user.countryOfHighschool) {
    redirect("/");
  }

  const roadmap = new Roadmap({
    countryOfHighschool: user.countryOfHighschool,
    citizenships: user.citizenships,
    plannedStudienkollegs: user.plannedStudienkollegs,
  });

  return {
    countryOfHighschool: user.countryOfHighschool,
    steps: roadmap.steps,
  }
}

const PREMIUM_FEATURES = [
  { icon: MessageCircle, text: "Personal guidance on WhatsApp through your entire journey" },
  { icon: BookOpen, text: 'Full access to the "Acing Aufnahmetest" course' },
  { icon: Users, text: "Community of Studienkolleg applicants" },
];

export default async function RoadmapPage() {
  const roadmapData = await getRoadmap();

  return (
    <main className="min-h-screen flex flex-col hero-background">
      <Header />
      <ConfettiOnFirstVisit />
      <main className="min-h-screen py-28">
        <section className="px-6 py-10 max-w-6xl mx-auto">
          <div className="mb-10 text-center">
            <Badge variant="secondary" className="mb-4 rounded-full px-4 py-1.5 bg-card border-border text-foreground">
              <Sparkles className="w-3 h-3 mr-1.5" /> Your roadmap is ready
            </Badge>
            <h1 className="text-4xl md:text-6xl font-semibold mb-4">
              From <span className="text-gradient-accent">{roadmapData.countryOfHighschool}</span> to Germany.
            </h1>
          </div>

          <div className="relative">
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-border md:-translate-x-1/2" />
            <div className="space-y-6">
              {roadmapData.steps.map((s, i) => {
                return (
                  <RoadmapStepDialog
                    key={s.key}
                    alignLeft={i % 2 === 0}
                    required={s.necessary === true}
                    stepKey={s.key}
                    stepNumber={i + 1}
                  />
                );
              })}
            </div>
          </div>

          <div className="mt-16">
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 md:p-12 text-center shadow-(--shadow-accent)">
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20" style={{ background: "var(--gradient-accent)" }} />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full opacity-20" style={{ background: "var(--gradient-accent)" }} />
              <div className="relative">
                <h2 className="text-3xl md:text-4xl font-semibold mb-3">
                  Want a <span className="text-gradient-accent">personal guide</span>?
                </h2>
                <p className="text-muted-foreground max-w-lg mx-auto mb-8">
                  Don&apos;t navigate this alone. Get direct support from someone who&apos;s been through it.
                </p>
                <div className="grid md:grid-cols-3 gap-4 text-left mb-8">
                  {PREMIUM_FEATURES.map((f, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-background/60 border border-border">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--gradient-accent)" }}>
                        <f.icon className="w-5 h-5 text-foreground" />
                      </div>
                      <p className="text-sm font-medium leading-snug pt-1">{f.text}</p>
                    </div>
                  ))}
                </div>
                <Link className={cn(buttonVariants(), "rounded-full h-12 px-8 bg-foreground text-background hover:bg-foreground/90 text-base font-medium has-[>svg]:px-4")} href="/acing-aufnahmetest">
                  Learn More <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </main>
  );
}

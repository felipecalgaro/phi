import { ArrowRight, Sparkles, Users, BookOpen, MessageCircle } from "lucide-react";
import { Header } from "@/components/header";
import { buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ConfettiOnFirstVisit } from "@/components/roadmap/confetti-on-first-visit";
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
            <Badge variant="secondary" className="mb-4 rounded-full px-4 py-1.5 bg-card border-border">
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
                const Icon = s.icon;
                const left = i % 2 === 0;
                return (
                  <Dialog key={s.key}>
                    <DialogTrigger asChild>
                      <div className={cn('relative flex md:items-center gap-4 md:gap-0', left ? "md:flex-row" : "md:flex-row-reverse")}>
                        <div className="md:w-1/2 w-full md:px-10 pl-20">
                          <button
                            className={cn('group w-full text-left rounded-3xl p-6 transition-all', {
                              'bg-background/40 border border-dashed border-border opacity-70 hover:opacity-100': !s.necessary,
                              'bg-card border border-border hover:shadow-(--shadow-accent) hover:-translate-y-0.5': s.necessary
                            })}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
                                Step {i + 1}
                              </span>
                              {!s.necessary && (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted-foreground/10 px-2 py-0.5 rounded-full">
                                  Not required
                                </span>
                              )}
                            </div>
                            <h3 className={`text-2xl font-semibold mb-2 ${!s.necessary ? "text-muted-foreground" : "group-hover:text-gradient-accent"}`}>{s.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              Click to see what to do here.
                            </p>
                          </button>
                        </div>
                        <div className="absolute left-8 md:left-1/2 md:-translate-x-1/2 top-6 md:top-1/2 md:-translate-y-1/2">
                          <div
                            className={`w-16 h-16 rounded-full flex items-center justify-center border-4 border-background shadow-lg ${!s.necessary ? "opacity-60 grayscale" : ""}`}
                            style={{ background: s.color }}
                          >
                            <Icon className="w-7 h-7 text-foreground" />
                          </div>
                        </div>
                        <div className="hidden md:block md:w-1/2" />
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-h-132 max-w-2xl overflow-hidden rounded-3xl p-0">
                      <div className="max-h-132 overflow-y-auto p-6 pr-8">
                        <DialogHeader>
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: s.color }}>
                            <Icon className="w-7 h-7 text-foreground" />
                          </div>
                          <DialogTitle className="text-2xl font-semibold">{s.title}</DialogTitle>
                          <DialogDescription className="sr-only">
                            Details for {s.title}
                          </DialogDescription>
                          <div className="space-y-4 pt-2 text-base leading-relaxed text-muted-foreground [&_a]:text-foreground [&_a]:font-medium [&_b]:text-foreground [&_em]:text-foreground [&_li]:pl-1 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
                            {s.description}
                          </div>
                        </DialogHeader>
                      </div>
                    </DialogContent>
                  </Dialog>
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

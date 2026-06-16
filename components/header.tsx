"use client";

import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const NAV_LINKS = [
  { href: "/acing-aufnahmetest", label: "Acing Aufnahmetest" },
  { href: "/exercises", label: "Exercises" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/blog", label: "Blog" },
];

export function Header() {
  return (
    <header className="fixed left-1/2 top-4 z-50 flex w-[calc(100%-1.5rem)] max-w-7xl -translate-x-1/2 items-center justify-between rounded-full border border-border bg-card/80 px-3 py-3 shadow-(--shadow-accent) backdrop-blur-sm sm:w-11/12">
      <div className="flex min-w-0 items-center gap-3">
        <Image
          src="/logo.svg"
          alt="Guide to Studienkolleg logo"
          width={32}
          height={32}
          className="shrink-0 rounded-md"
          priority
        />
        <Link href="/" className="min-w-0 truncate text-base font-bold sm:text-xl">
          Guide to Studienkolleg
        </Link>
      </div>

      <nav className="hidden items-center justify-center gap-8 pr-8 text-base font-light lg:flex">
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>

      <Sheet>
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 rounded-full lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent className="bg-card" side="right">
          <SheetHeader className="border-b border-border px-5 py-5 text-left">
            <SheetTitle>Guide to Studienkolleg</SheetTitle>
            <SheetDescription className="sr-only">
              Site navigation
            </SheetDescription>
          </SheetHeader>
          <nav className="flex flex-col gap-1 px-3 py-2">
            {NAV_LINKS.map((link) => (
              <SheetClose key={link.href} asChild>
                <Link
                  href={link.href}
                  className="rounded-lg px-3 py-3 text-base font-medium transition-colors hover:bg-accent"
                >
                  {link.label}
                </Link>
              </SheetClose>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}

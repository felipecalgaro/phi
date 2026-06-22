"use client";

import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
  { href: "/roadmap", label: "Roadmap" },
  { href: "/exercises", label: "Exercises" },
  { href: "/blog", label: "Blog" },
];

export function Header() {
  return (
    <header className="pl-3 fixed left-1/2 top-4 z-50 flex max-w-7xl -translate-x-1/2 items-center justify-between rounded-full border border-border bg-card/80 px-2 py-2 shadow-lg/5 backdrop-blur-sm w-11/12">
      <div className="flex min-w-0 items-center gap-3">
        <Image
          src="/logo.svg"
          alt="Guide to Studienkolleg logo"
          width={32}
          height={32}
          className="shrink-0 rounded-md"
          priority
        />
        <Link href="/" className="min-w-0 truncate font-bold text-xl sm:block hidden">
          Guide to Studienkolleg
        </Link>
        <Link href="/" className="min-w-0 truncate font-bold text-xl sm:hidden xs:block hidden">
          GSTK
        </Link>
      </div>

      <div className="flex items-center gap-1">
        <nav className="flex items-center justify-center gap-8 text-base font-light">
          <div className='justify-center items-center gap-8 lg:flex hidden'>
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
          <Link href="/acing-aufnahmetest" className="flex xs:text-base text-sm items-center rounded-full border-primary border bg-primary/40 px-4 h-10 transition-colors hover:bg-primary/50">
            Acing Aufnahmetest
          </Link>
        </nav>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 rounded-full lg:hidden bg-gray-100 hover:bg-gray-200 size-10"
              aria-label="Open navigation menu"
            >
              <Menu strokeWidth={1.5} className="size-6" />
            </Button>
          </SheetTrigger>
          <SheetContent className="w-72 gap-0 border-border bg-card/95 p-0 shadow-2xl backdrop-blur" side="right">
            <SheetHeader className="px-6 pb-4 pt-6 text-left">
              <SheetTitle className="max-w-48 text-lg font-normal leading-tight">
                Guide to Studienkolleg
              </SheetTitle>
              <SheetDescription className="sr-only">
                Site navigation
              </SheetDescription>
            </SheetHeader>
            <Separator />
            <nav className="flex flex-col px-3 py-4">
              {NAV_LINKS.map((link) => (
                <SheetClose key={link.href} asChild>
                  <Link
                    href={link.href}
                    className="rounded-xl px-3 py-3.5 text-lg font-light transition-colors hover:bg-gray-200 hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                  >
                    {link.label}
                  </Link>
                </SheetClose>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

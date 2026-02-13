import { LogoutButton } from '@/components/acing-aufnahmetest/logout-button';
import lessons from '@/data/lessons.json';
import { Download, MoveLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default async function Lessons() {
  return (
    <div className="min-h-screen bg-background pb-40 flex justify-center items-center flex-col">
      <header className="h-12 flex items-center sm:px-20 xs:px-8 px-4 gap-3 shrink-0 justify-between max-w-5xl w-full">
        <Link href="/acing-aufnahmetest" className="flex items-center gap-2">
          <MoveLeft className="size-5" />
        </Link>
        <span className="text-sm font-semibold text-foreground tracking-tight">
          Acing Aufnahmetest
        </span>
        <LogoutButton />
      </header>

      <hr className="w-full border-border" />

      <main className="max-w-5xl w-full px-6 py-8">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Lessons
          </h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lessons.map((lesson) => (
            <Link
              key={lesson.id}
              href={`/acing-aufnahmetest/lessons/${lesson.slug}`}
              className="text-left rounded-xl overflow-hidden bg-card border border-border"
            >
              <Image width={316} height={178} src={`/lesson-thumbnails/${lesson.slug}.png`} alt={lesson.slug} className="aspect-video bg-muted relative" />

              <div className="p-3">
                <p className="text-sm font-medium text-foreground leading-snug line-clamp-2">
                  {lesson.title}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{lesson.module}</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="max-w-5xl mx-auto px-6 py-10 mt-16">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Materials & Resources
          </h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href='#'
            className="text-left rounded-xl overflow-hidden bg-card border border-border"
          >
            <div className="aspect-video bg-muted relative">
              <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                <Download className="size-4 inline-block" />
              </div>
            </div>
            <div className="px-3 py-4">
              <p className="text-sm font-medium text-foreground leading-snug line-clamp-2">
                MATERIAL
              </p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
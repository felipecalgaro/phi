import { LogoutButton } from '@/components/acing-aufnahmetest/logout-button';
import { env } from '@/lib/env';
import prisma from '@/lib/prisma';
import { Download, FileText, MoveLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { RESOURCES } from '@/data/acing-aufnahmetest/resources';

export const revalidate = 3600

export default async function Lessons() {
  const lessons = await prisma.lesson.findMany({
    select: {
      id: true,
      slug: true,
      title: true,
      module: true,
      description: true,
    },
  })

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
          <h1 className="text-2xl font-semibold text-foreground tracking-tight text-center">
            Lessons
          </h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lessons.map((lesson) => {
            const imageUrl = `https://${env.CLOUDFRONT_DOMAIN}/video-thumbnails/${lesson.slug}.png`

            return (
              <Link
                key={lesson.id}
                href={`/acing-aufnahmetest/lessons/${lesson.slug}`}
                className="flex justify-center items-center"
              >
                <div className='text-left rounded-xl overflow-hidden bg-card border border-border w-full'>
                  <Image width={316} height={178} src={imageUrl} alt={lesson.slug} className="aspect-video bg-muted relative w-full" />

                  <div className="p-3">
                    <p className="text-sm font-medium text-foreground leading-snug line-clamp-2">
                      {lesson.title}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{lesson.module}</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
        <div className="max-w-5xl px-6 py-10 mt-16">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight text-center">
            Resources
          </h1>
        </div>
        <div className="flex flex-col gap-16 mt-8">
          {Object.entries(RESOURCES).map(([category, files]) => {
            return (
              <div key={category} className='flex flex-col gap-8'>
                <h2 className="text-xl font-medium text-foreground tracking-tight mx-6">
                  {category}
                </h2>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                  {files.map(file => {
                    const fileUrl = `https://${env.CLOUDFRONT_DOMAIN}/resources/${file.slug}.pdf`

                    return (
                      <Link
                        key={file.name}
                        href={fileUrl}
                        className="text-left rounded-xl overflow-hidden bg-card border border-border"
                      >
                        <div className="aspect-video bg-muted relative">
                          <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                            <Download className="size-4 inline-block" />
                          </div>
                          <FileText className="size-16 text-muted-foreground absolute inset-0 m-auto" />
                        </div>
                        <div className="px-3 py-4">
                          <p className="text-sm font-medium text-foreground leading-snug line-clamp-2">
                            {file.name}
                          </p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  );
}
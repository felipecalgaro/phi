import Link from 'next/link'
import { Calculator, FileText, Target } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  {
    title: "Math exercises",
    href: "/exercises/math",
    icon: Calculator,
    background: "bg-secondary/40"
  },
  {
    title: "C-Tests",
    href: "/exercises/c-test",
    icon: FileText,
    background: "bg-primary/40"
  },
  {
    title: "Aufnahmetest Course",
    href: '/acing-aufnahmetest',
    icon: Target,
    background: "bg-black/10"
  }
]

export default async function Home() {
  return (
    <main className="flex flex-col items-center justify-start gap-24 py-16 sm:px-12 xs:px-8 px-4 mb-40">
      <h1 className="sm:text-6xl text-4xl text-center font-bold">Aufnahmetest Exercises</h1>
      <div className="flex flex-col gap-4 w-full max-w-2xl">
        {links.map(({ title, href, icon: Icon, background }, index) => (
          <Link href={href} key={index} className='max-[360px]:px-6 px-10 bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6'>
            <div className="flex items-center gap-4">
              <div className={cn(background, "rounded-lg p-2")}>
                <Icon className="size-5" />
              </div>
              <div>
                <h3 className="text-lg font-medium">{title}</h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
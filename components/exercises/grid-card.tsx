import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface GridCardProps {
  className?: string
  children: ReactNode
}

export function GridCard({ className, children }: GridCardProps) {
  return (
    <div className={cn('bg-white shadow-md shadow-gray-300 rounded-2xl flex flex-col justify-between items-start sm:py-8 py-7 xs:px-8 px-6', className)}>
      {children}
    </div>
  )
}
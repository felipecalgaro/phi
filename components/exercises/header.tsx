import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ReactNode } from 'react';

interface ExercisesHeaderProps {
  children?: ReactNode;
  className?: string;
}

export function ExercisesHeader({ children, className }: ExercisesHeaderProps) {
  return (
    <header className={cn('flex justify-center items-center w-full py-6 sm:px-12 px-6 text-white', className)}>
      <nav className='flex items-center justify-between h-full max-w-[1200px] w-full gap-x-8'>
        <Link href='/' className='hover:underline'>
          Home
        </Link>
        <div className='flex justify-center items-center sm:gap-8 gap-5'>
          {children}
        </div>
      </nav>
    </header>
  )
}
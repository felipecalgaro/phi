'use client'

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { buttonVariants } from '../ui/button';
import { useGetClientSession } from '@/hooks/use-get-client-session';

export function LoginButton() {
  const { data, isPending, isError } = useGetClientSession()

  if (isPending) {
    return <Link href="#" className={cn(buttonVariants(), "bg-white hover:bg-white/90 text-foreground")}>Login</Link>
  }

  if (isError) {
    return <Link href="/acing-aufnahmetest/login" className={cn(buttonVariants(), "bg-white hover:bg-white/90 text-foreground")}>Login</Link>
  }

  if (!data.isAuthenticated) {
    return (
      <Link href="/acing-aufnahmetest/login" className={cn(buttonVariants(), "bg-white hover:bg-white/90 text-foreground")}>Login</Link>
    )
  }

  return
}
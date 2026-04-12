'use client'

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Button, buttonVariants } from '../ui/button';
import { useGetClientSession } from '@/hooks/use-get-client-session';
import { logoutUser } from '@/actions/acing-aufnahmetest/logout-user';
import { useQueryClient } from '@tanstack/react-query';

export function LogInOutButton() {
  const { data, isPending, isError } = useGetClientSession()
  const queryClient = useQueryClient()

  async function handleLogout() {
    queryClient.clear()
    await logoutUser()
  }

  if (isPending) {
    return <Link href="#" className={cn(buttonVariants(), "bg-white hover:bg-white/90 text-foreground")}>Login</Link>
  }

  if (isError) {
    return <Link href="/acing-aufnahmetest/login" className={cn(buttonVariants(), "bg-white hover:bg-white/90 text-foreground")}>Login</Link>
  }

  if (data.isAuthenticated) {
    return (
      <Button variant='ghost' className="text-white/80 hover:text-white order-2" onClick={handleLogout}>
        Logout
      </Button>
    )
  }

  return (
    <Link href="/acing-aufnahmetest/login" className={cn(buttonVariants(), "bg-white hover:bg-white/90 text-foreground")}>Login</Link>
  )
}
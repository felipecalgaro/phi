'use client'

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Button, buttonVariants } from '../ui/button';
import { useGetClientSession } from '@/hooks/use-get-client-session';
import { logoutUser } from '@/actions/acing-aufnahmetest/logout-user';
import { useQueryClient } from '@tanstack/react-query';
import { LogIn, LogOutIcon } from 'lucide-react';

type LogInOutButtonProps = {
  className?: string;
}

export function LogInOutButton({
  className,
}: LogInOutButtonProps = {}) {
  const { data, isPending, isError } = useGetClientSession()
  const queryClient = useQueryClient()

  async function handleLogout() {
    queryClient.clear()
    await logoutUser()
  }

  const buttonClasses = cn(buttonVariants(), "bg-white hover:bg-white/90 text-foreground has-[>svg]:px-6", className)

  if (isPending) {
    return (
      <Link href="#" className={buttonClasses}>
        Login
        <LogIn className="size-5" />
      </Link>
    )
  }

  if (isError) {
    return (
      <Link href="/acing-aufnahmetest/login" className={buttonClasses}>
        Login
        <LogIn className="size-5" />
      </Link>
    )
  }

  if (data.isAuthenticated) {
    return (
      <Button className={buttonClasses} onClick={handleLogout}>
        Logout
        <LogOutIcon className="size-5" />
      </Button>
    )
  }

  return (
    <Link href="/acing-aufnahmetest/login" className={buttonClasses}>
      Login
      <LogIn className="size-5" />
    </Link>
  )
}

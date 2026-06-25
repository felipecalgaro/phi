'use client'

import { logoutUser } from '@/actions/acing-aufnahmetest/logout-user'
import { useQueryClient } from '@tanstack/react-query'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
  const queryClient = useQueryClient()

  async function handleLogout() {
    queryClient.clear()
    await logoutUser()
  }

  return (
    <button
      type="button"
      aria-label="Log out"
      className="flex size-10 items-center justify-center rounded-full border border-border bg-background transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
      onClick={handleLogout}
    >
      <LogOut className="size-5 cursor-pointer" />
    </button>
  )
}

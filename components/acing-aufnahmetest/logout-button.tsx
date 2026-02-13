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
    <button onClick={handleLogout}>
      <LogOut className="size-5 cursor-pointer" />
    </button>
  )
}
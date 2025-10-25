"use client"

import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'

export function SignOutButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => signOut({ callbackUrl: '/auth/signin' })}
    >
      <LogOut className="h-4 w-4 mr-2" />
      Sign Out
    </Button>
  )
}
"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Building, LogOut, MessageSquare, Shield } from "lucide-react"

export function DashboardNav() {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <MessageSquare className="h-5 w-5" />
            <span>Multi-Tenant Chat</span>
          </Link>

          <nav className="hidden md:flex gap-6">
            <Link href="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
              Chat
            </Link>
            <Link
              href="/dashboard/members"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Members
            </Link>
            <Link
              href="/dashboard/settings"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Settings
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <Building className="h-4 w-4" />
              <span className="font-medium">{user.tenantName}</span>
              {user.role === "admin" && <Shield className="h-4 w-4 text-blue-500" />}
            </div>
          )}

          <div className="flex items-center gap-4">
            <ModeToggle />
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}


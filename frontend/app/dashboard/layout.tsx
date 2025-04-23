import type React from "react"
import { DashboardNav } from "@/components/dashboard-nav"
import { AuthProvider } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/protected-route"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <div className="flex min-h-screen flex-col">
          <DashboardNav />
          <div className="flex-1">{children}</div>
        </div>
      </ProtectedRoute>
    </AuthProvider>
  )
}


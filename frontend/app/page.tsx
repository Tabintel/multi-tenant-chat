import { LoginForm } from "@/components/login-form"
import { AuthProvider } from "@/contexts/auth-context"
import Link from "next/link"

export default function Home() {
  return (
    <AuthProvider>
      <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="max-w-md w-full">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Multi-Tenant Chat</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Secure, isolated chat environments for your organization
            </p>
          </div>
          <LoginForm />
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account? <Link href="/register" className="text-blue-600 hover:underline">Sign up</Link>
          </div>
        </div>
      </main>
    </AuthProvider>
  )
}

import { RegisterForm } from "@/components/login-form";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-md w-full">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Multi-Tenant Chat</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Create your account for your organization
          </p>
        </div>
        <RegisterForm />
      </div>
    </main>
  );
}

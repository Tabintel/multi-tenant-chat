"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { listTenants } from "@/app/lib/api"

export function LoginForm() {
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [tenants, setTenants] = useState<{ id: string, name: string }[]>([])
  const [organization, setOrganization] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  // Show mock tenants (for demo login only) and merge real backend tenants for real login
  const mockTenants = [
    { id: "tenant-a", name: "Tenant A Corp" },
    { id: "tenant-b", name: "Tenant B Inc" },
    { id: "tenant-c", name: "Tenant C LLC" }
  ];

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        // Always fetch without JWT for public endpoint
        const res = await fetch('http://localhost:8080/tenants');
        if (!res.ok) throw new Error('Failed to fetch tenants');
        const data = await res.json();
        console.log("Fetched tenants from backend:", data); // Log backend tenants for debug
        const backendTenants = Array.isArray(data) ? data : data.tenants || [];
        // Patch: support both backend {ID, Name} and frontend {id, name}
        const normalizedTenants = backendTenants.map((t: any) => ({
          id: t.id || t.ID,
          name: t.name || t.Name
        }));
        // Merge mock and backend tenants by id
        const allTenants = [...mockTenants];
        normalizedTenants.forEach((t: any) => {
          if (t && t.id && !allTenants.some(mt => mt.id === t.id)) {
            allTenants.push(t);
          }
        });
        setTenants(allTenants);
        // Auto-select the most recently created backend tenant if present, else default to first
        if (normalizedTenants.length > 0) setOrganization(normalizedTenants[normalizedTenants.length - 1].id);
        else setOrganization(allTenants[0]?.id || "");
      } catch (e) {
        setTenants([...mockTenants]);
        setOrganization(mockTenants[0].id);
      }
    };
    fetchTenants();
  }, []);

  // Enhanced login handler: Only real tenants use backend auth, mock tenants use demo login
  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const isMock = mockTenants.some(t => t.id === organization);
      if (isMock) {
        // Demo login: no backend call, just mock user
        localStorage.setItem("token", "mock-jwt-token");
        localStorage.setItem("user", JSON.stringify({ name: email.split("@")[0], email, tenantId: organization }));
        toast({ title: "Demo login successful", description: `Welcome to ${organization}` });
        router.push("/dashboard");
      } else {
        // Real login: backend auth
        await login(email || "demo@example.com", password || "password", organization);
        toast({ title: "Login successful", description: "Welcome to your organization's chat workspace" });
      }
    } catch (error) {
      setError("Invalid email or password");
      toast({ title: "Login failed", description: "Invalid email or password", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Enter your credentials to access your organization's chat</CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="organization">Organization</Label>
            <Select required value={organization} onValueChange={setOrganization}>
              <SelectTrigger>
                <SelectValue placeholder="Select organization" />
              </SelectTrigger>
              <SelectContent>
                {tenants.length === 0 ? (
                  <SelectItem value="no-tenants" disabled>No organizations found</SelectItem>
                ) : (
                  tenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>{tenant.name}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="demo@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter any password for demo"
            />
          </div>

          {error && <div className="text-sm text-red-500">{error}</div>}

          <div className="text-sm text-muted-foreground">
            <p>For demo purposes, you can use any email/password.</p>
            <p>Use an email containing "admin" for admin privileges.</p>
          </div>
        </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export function RegisterForm() {
  const { register } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("ADMIN")
  const [orgName, setOrgName] = useState("")
  const [error, setError] = useState("")

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setIsLoading(true)
    try {
      // Directly call the register API function from app/lib/api.ts
      const res = await import("@/app/lib/api").then(m => m.register({ name, email, password, role, org_name: orgName }))
      toast({ title: "Registration successful", description: "You can now log in." })
      setName(""); setEmail(""); setPassword(""); setRole("ADMIN"); setOrgName("")
      router.push("/")
    } catch (error: any) {
      setError(error.message || "Registration failed")
      toast({ title: "Registration failed", description: error.message || "Registration failed", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>Create your organization and admin account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="org_name">Organization Name</Label>
            <Input id="org_name" value={orgName} onChange={e => setOrgName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="MODERATOR">Moderator</SelectItem>
                <SelectItem value="MEMBER">Member</SelectItem>
                <SelectItem value="GUEST">Guest</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Sign Up"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

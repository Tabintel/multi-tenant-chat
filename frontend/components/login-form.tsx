"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export function LoginForm() {
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [organization, setOrganization] = useState("tenant-a")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")

    if (!organization) {
      setError("Please select an organization")
      return
    }

    try {
      setIsLoading(true)

      // Call login from auth context
      await login(email || "demo@example.com", password || "password", organization)

      toast({
        title: "Login successful",
        description: "Welcome to your organization's chat workspace",
      })
    } catch (error) {
      console.error("Login error:", error)
      setError("Invalid email or password")

      toast({
        title: "Login failed",
        description: "Invalid email or password",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
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
                <SelectItem value="tenant-a">Tenant A Corp</SelectItem>
                <SelectItem value="tenant-b">Tenant B Inc</SelectItem>
                <SelectItem value="tenant-c">Tenant C LLC</SelectItem>
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


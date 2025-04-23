"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { tenantApi, userApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { ProtectedRoute } from "@/components/protected-route"
import { Loader2 } from "lucide-react"

export default function SettingsPage() {
  const { user, hasPermission } = useAuth()
  const [isLoadingTenant, setIsLoadingTenant] = useState(true)
  const [isSavingGeneral, setIsSavingGeneral] = useState(false)
  const [isSavingNotifications, setIsSavingNotifications] = useState(false)
  const [isSavingSecurity, setIsSavingSecurity] = useState(false)

  // General settings
  const [orgName, setOrgName] = useState("")
  const [orgDescription, setOrgDescription] = useState("")
  const [orgWebsite, setOrgWebsite] = useState("")

  // Notification settings
  const [directMessages, setDirectMessages] = useState(true)
  const [mentions, setMentions] = useState(true)
  const [channelMessages, setChannelMessages] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState(true)

  // Security settings
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [twoFactor, setTwoFactor] = useState(false)

  useEffect(() => {
    // Fetch tenant settings
    const fetchTenantSettings = async () => {
      if (!user) return

      try {
        setIsLoadingTenant(true)

        // Try to fetch tenant from API
        try {
          const { tenant } = await tenantApi.getTenant(user.tenantId)
          setOrgName(tenant.name)
          setOrgDescription(tenant.description || "A secure chat workspace for your organization")
          setOrgWebsite(tenant.website || "https://example.com")
        } catch (error) {
          console.warn("Error fetching tenant settings:", error)

          // Use default values
          setOrgName(user.tenantName)
          setOrgDescription("A secure chat workspace for your organization")
          setOrgWebsite("https://example.com")
        }
      } catch (error) {
        console.error("Error fetching settings:", error)
        toast({
          title: "Error",
          description: "Failed to load settings",
          variant: "destructive",
        })
      } finally {
        setIsLoadingTenant(false)
      }
    }

    fetchTenantSettings()
  }, [user])

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !hasPermission("manage_tenant")) return

    try {
      setIsSavingGeneral(true)

      // Update tenant via API
      await tenantApi.updateTenant(user.tenantId, {
        name: orgName,
        description: orgDescription,
        website: orgWebsite,
      })

      toast({
        title: "Settings saved",
        description: "Your organization settings have been updated",
      })
    } catch (error) {
      console.error("Error saving general settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setIsSavingGeneral(false)
    }
  }

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault()

    // In a real app, this would call your API
    setIsSavingNotifications(true)

    // Simulate API call
    setTimeout(() => {
      setIsSavingNotifications(false)
      toast({
        title: "Notification preferences saved",
        description: "Your notification settings have been updated",
      })
    }, 1000)
  }

  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSavingSecurity(true)

      if (password) {
        // Update password via API
        await userApi.changePassword(user.id, {
          current_password: "current-password", // In a real app, you would have a field for this
          new_password: password,
        })
      }

      // Update 2FA settings (in a real app)
      // This would call a separate API endpoint

      toast({
        title: "Security settings updated",
        description: "Your security settings have been saved",
      })
    } catch (error) {
      console.error("Error saving security settings:", error)
      toast({
        title: "Error",
        description: "Failed to update security settings",
        variant: "destructive",
      })
    } finally {
      setIsSavingSecurity(false)
      setPassword("")
      setConfirmPassword("")
    }
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        <Tabs defaultValue="general">
          <TabsList className="mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Organization Settings</CardTitle>
                <CardDescription>Manage your {user?.tenantName || "Organization"} settings</CardDescription>
              </CardHeader>
              <form onSubmit={handleSaveGeneral}>
                <CardContent className="space-y-4">
                  {isLoadingTenant ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="org-name">Organization Name</Label>
                        <Input
                          id="org-name"
                          value={orgName}
                          onChange={(e) => setOrgName(e.target.value)}
                          disabled={!hasPermission("manage_tenant")}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="org-description">Description</Label>
                        <Input
                          id="org-description"
                          value={orgDescription}
                          onChange={(e) => setOrgDescription(e.target.value)}
                          disabled={!hasPermission("manage_tenant")}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="org-website">Website</Label>
                        <Input
                          id="org-website"
                          type="url"
                          value={orgWebsite}
                          onChange={(e) => setOrgWebsite(e.target.value)}
                          disabled={!hasPermission("manage_tenant")}
                        />
                      </div>
                    </>
                  )}
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSavingGeneral || !hasPermission("manage_tenant")}>
                    {isSavingGeneral ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Configure how you want to receive notifications</CardDescription>
              </CardHeader>
              <form onSubmit={handleSaveNotifications}>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="direct-messages">Direct Messages</Label>
                      <p className="text-sm text-muted-foreground">Get notified when you receive a direct message</p>
                    </div>
                    <Switch id="direct-messages" checked={directMessages} onCheckedChange={setDirectMessages} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="mentions">Mentions</Label>
                      <p className="text-sm text-muted-foreground">Get notified when you are mentioned in a channel</p>
                    </div>
                    <Switch id="mentions" checked={mentions} onCheckedChange={setMentions} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="channel-messages">Channel Messages</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified for all messages in channels you follow
                      </p>
                    </div>
                    <Switch id="channel-messages" checked={channelMessages} onCheckedChange={setChannelMessages} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive email notifications when you're offline</p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSavingNotifications}>
                    {isSavingNotifications ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Preferences"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security and permissions</CardDescription>
              </CardHeader>
              <form onSubmit={handleSaveSecurity}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Change Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                    </div>
                    <Switch id="two-factor" checked={twoFactor} onCheckedChange={setTwoFactor} />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSavingSecurity}>
                    {isSavingSecurity ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Security Settings"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}


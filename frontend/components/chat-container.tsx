"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { ChatList } from "@/components/chat-list"
import { StreamChatWindow } from "@/components/stream-chat-window"
import { getUserChannels, createChannel } from "@/lib/stream-chat"
import { channelApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Plus } from "lucide-react"

export function ChatContainer() {
  const { user, hasPermission } = useAuth()
  const [channels, setChannels] = useState<any[]>([])
  const [activeChannel, setActiveChannel] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingChannel, setIsCreatingChannel] = useState(false)
  const [newChannelName, setNewChannelName] = useState("")
  const [newChannelDescription, setNewChannelDescription] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    // Fetch channels
    const fetchChannels = async () => {
      if (!user) return

      try {
        setIsLoading(true)

        // Try to fetch channels from API
        try {
          const { channels } = await channelApi.getChannels()
          setChannels(channels)

          if (channels.length > 0) {
            setActiveChannel(channels[0].id)
          }
        } catch (apiError) {
          console.warn("Error fetching channels from API, falling back to Stream:", apiError)

          // Fallback to Stream Chat API
          const streamChannels = await getUserChannels(user.tenantId)
          setChannels(streamChannels)

          if (streamChannels.length > 0) {
            setActiveChannel(streamChannels[0].id)
          }
        }
      } catch (error) {
        console.error("Error fetching channels:", error)
        toast({
          title: "Error",
          description: "Failed to load channels",
          variant: "destructive",
        })

        // Use mock channels as a last resort
        const mockChannels = getMockChannels(user.tenantId)
        setChannels(mockChannels)

        if (mockChannels.length > 0) {
          setActiveChannel(mockChannels[0].id)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchChannels()
  }, [user])

  // Mock channels for demo/fallback purposes
  const getMockChannels = (tenantId: string) => {
    const mockChannelsByTenant: Record<string, any[]> = {
      "tenant-a": [
        { id: "a-general", data: { name: "general" }, state: { unreadCount: 0 } },
        { id: "a-marketing", data: { name: "marketing" }, state: { unreadCount: 2 } },
        { id: "a-engineering", data: { name: "engineering" }, state: { unreadCount: 0 } },
      ],
      "tenant-b": [
        { id: "b-general", data: { name: "general" }, state: { unreadCount: 0 } },
        { id: "b-sales", data: { name: "sales" }, state: { unreadCount: 3 } },
        { id: "b-support", data: { name: "support" }, state: { unreadCount: 1 } },
      ],
      "tenant-c": [
        { id: "c-general", data: { name: "general" }, state: { unreadCount: 0 } },
        { id: "c-design", data: { name: "design" }, state: { unreadCount: 0 } },
        { id: "c-product", data: { name: "product" }, state: { unreadCount: 4 } },
      ],
    }

    return mockChannelsByTenant[tenantId] || []
  }

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newChannelName.trim() || !user) return

    try {
      setIsCreatingChannel(true)

      // Create channel via API
      try {
        const { channel } = await channelApi.createChannel({
          name: newChannelName,
          description: newChannelDescription,
        })

        // Add new channel to the list
        setChannels([
          ...channels,
          {
            id: channel.id,
            data: { name: channel.name },
            state: { unreadCount: 0 },
          },
        ])

        // Select the new channel
        setActiveChannel(channel.id)
      } catch (apiError) {
        console.warn("Error creating channel via API, falling back to Stream:", apiError)

        // Fallback to Stream Chat API
        const streamChannel = await createChannel({
          name: newChannelName,
          description: newChannelDescription,
          tenantId: user.tenantId,
        })

        // Add new channel to the list
        setChannels([...channels, streamChannel])

        // Select the new channel
        setActiveChannel(streamChannel.id)
      }

      // Reset form
      setNewChannelName("")
      setNewChannelDescription("")
      setIsDialogOpen(false)

      toast({
        title: "Success",
        description: `Channel "${newChannelName}" created successfully`,
      })
    } catch (error) {
      console.error("Error creating channel:", error)
      toast({
        title: "Error",
        description: "Failed to create channel",
        variant: "destructive",
      })
    } finally {
      setIsCreatingChannel(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="md:col-span-1">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Channels</h3>
            <p className="text-sm text-muted-foreground">{user?.tenantName || "Organization"} workspace</p>
          </div>
          <div className="p-2">
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-sm font-medium">Channels</span>
              {hasPermission("manage_channels") && (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Plus className="h-4 w-4" />
                      <span className="sr-only">Add channel</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Channel</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateChannel} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="channel-name">Channel Name</Label>
                        <Input
                          id="channel-name"
                          value={newChannelName}
                          onChange={(e) => setNewChannelName(e.target.value)}
                          placeholder="e.g. general, marketing, engineering"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="channel-description">Description (optional)</Label>
                        <Textarea
                          id="channel-description"
                          value={newChannelDescription}
                          onChange={(e) => setNewChannelDescription(e.target.value)}
                          placeholder="What is this channel about?"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isCreatingChannel}>
                          {isCreatingChannel ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            "Create Channel"
                          )}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {isLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                Loading channels...
              </div>
            ) : channels.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No channels yet.{" "}
                {hasPermission("manage_channels") ? "Create your first channel!" : "Ask an admin to create channels."}
              </div>
            ) : (
              <ChatList
                channels={channels.map((channel) => ({
                  id: channel.id,
                  name: channel.data?.name || channel.id,
                  unread: channel.state?.unreadCount || 0,
                }))}
                activeChannel={activeChannel}
                onSelectChannel={setActiveChannel}
              />
            )}
          </div>
        </div>
      </div>

      <div className="md:col-span-3">
        {activeChannel ? (
          <div className="h-[calc(100vh-12rem)] rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
            <StreamChatWindow channelId={activeChannel} />
          </div>
        ) : (
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 text-center">
            <p>Select a channel to start chatting</p>
          </div>
        )}
      </div>
    </div>
  )
}


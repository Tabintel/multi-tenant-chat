"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"

interface Channel {
  id: string
  name: string
  unread: number
}

interface ChatListProps {
  channels: Channel[]
  activeChannel: string | null
  onSelectChannel: (channelId: string) => void
}

export function ChatList({ channels, activeChannel, onSelectChannel }: ChatListProps) {
  return (
    <div className="p-2">
      <div className="flex items-center justify-between px-2 mb-2">
        <span className="text-sm font-medium">Channels</span>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <Plus className="h-4 w-4" />
          <span className="sr-only">Add channel</span>
        </Button>
      </div>

      <div className="space-y-1">
        {channels.map((channel) => (
          <Button
            key={channel.id}
            variant={activeChannel === channel.id ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => onSelectChannel(channel.id)}
          >
            <span className="truncate"># {channel.name}</span>
            {channel.unread > 0 && (
              <Badge variant="destructive" className="ml-auto">
                {channel.unread}
              </Badge>
            )}
          </Button>
        ))}
      </div>
    </div>
  )
}


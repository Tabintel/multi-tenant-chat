"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Paperclip, Send, User } from "lucide-react"

// Mock data for demo purposes
const MOCK_MESSAGES = {
  "a-general": [
    { id: "1", user: "Alice", text: "Hello everyone! Welcome to Tenant A's general channel.", timestamp: "10:30 AM" },
    { id: "2", user: "Bob", text: "Hi Alice! Thanks for setting this up.", timestamp: "10:32 AM" },
    { id: "3", user: "Charlie", text: "I'm excited to use this new chat system!", timestamp: "10:35 AM" },
  ],
  "a-marketing": [
    { id: "1", user: "Diana", text: "Let's discuss the new campaign here.", timestamp: "11:00 AM" },
    { id: "2", user: "Alice", text: "I've prepared some materials, will share soon.", timestamp: "11:05 AM" },
  ],
  "a-engineering": [
    { id: "1", user: "Eve", text: "Any updates on the API integration?", timestamp: "09:45 AM" },
    { id: "2", user: "Frank", text: "I'm working on it, should be done by EOD.", timestamp: "09:50 AM" },
    { id: "3", user: "Grace", text: "Let me know if you need any help with testing.", timestamp: "09:55 AM" },
    { id: "4", user: "Frank", text: "Thanks, will do!", timestamp: "10:00 AM" },
    { id: "5", user: "Eve", text: "Great, looking forward to it.", timestamp: "10:05 AM" },
  ],
  "b-general": [
    { id: "1", user: "John", text: "Hello team! This is Tenant B's general channel.", timestamp: "09:00 AM" },
    { id: "2", user: "Kate", text: "Morning John!", timestamp: "09:05 AM" },
  ],
  "b-sales": [
    { id: "1", user: "Liam", text: "Q2 targets are now available in the dashboard.", timestamp: "08:30 AM" },
    { id: "2", user: "Mia", text: "Thanks Liam, I'll review them today.", timestamp: "08:35 AM" },
    { id: "3", user: "Noah", text: "Can we discuss the new incentive structure?", timestamp: "08:40 AM" },
  ],
  "b-support": [
    { id: "1", user: "Olivia", text: "New ticket from Acme Corp - priority high.", timestamp: "10:15 AM" },
    { id: "2", user: "Peter", text: "I'll take it.", timestamp: "10:17 AM" },
  ],
  "c-general": [
    { id: "1", user: "Quinn", text: "Welcome to Tenant C's workspace!", timestamp: "01:00 PM" },
    { id: "2", user: "Rachel", text: "Thanks Quinn, glad to be here.", timestamp: "01:05 PM" },
  ],
  "c-design": [
    { id: "1", user: "Sam", text: "I've uploaded the new mockups to Figma.", timestamp: "02:30 PM" },
    { id: "2", user: "Taylor", text: "They look great! Just left some comments.", timestamp: "02:45 PM" },
  ],
  "c-product": [
    { id: "1", user: "Uma", text: "Roadmap planning session tomorrow at 10 AM.", timestamp: "03:00 PM" },
    { id: "2", user: "Victor", text: "I'll be there.", timestamp: "03:05 PM" },
    { id: "3", user: "Wendy", text: "Me too, I have some feature requests to discuss.", timestamp: "03:10 PM" },
  ],
}

interface ChatWindowProps {
  channelId: string
  channelName: string
}

export function ChatWindow({ channelId, channelName }: ChatWindowProps) {
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [currentUser, setCurrentUser] = useState({ name: "" })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // In a real app, you would fetch messages from the Stream API
    setMessages(MOCK_MESSAGES[channelId as keyof typeof MOCK_MESSAGES] || [])

    // Get current user
    const userJson = localStorage.getItem("user")
    if (userJson) {
      setCurrentUser(JSON.parse(userJson))
    }
  }, [channelId])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim()) return

    // In a real app, you would send the message to the Stream API
    const newMsg = {
      id: Date.now().toString(),
      user: currentUser.name,
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages([...messages, newMsg])
    setNewMessage("")
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">#{channelName}</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="flex items-start gap-3">
            <Avatar>
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{message.user}</span>
                <span className="text-xs text-muted-foreground">{message.timestamp}</span>
              </div>
              <p className="text-sm mt-1">{message.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Button type="button" variant="outline" size="icon" className="shrink-0">
            <Paperclip className="h-4 w-4" />
            <span className="sr-only">Attach file</span>
          </Button>
          <Input
            placeholder={`Message #${channelName}`}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon" className="shrink-0">
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </div>
    </div>
  )
}


"use client";

import { ChatContainer } from "@/components/chat-container"
import { useEffect, useState } from "react";
import { listChannels, getMessages } from "@/app/lib/api";

const mockTenantIds = ["tenant-a", "tenant-b", "tenant-c"];

export default function DashboardPage() {
  const [channels, setChannels] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get user from localStorage when component mounts
  const [user, setUser] = useState(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    }
    return null;
  });

  const jwt = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
  const isMock = user && mockTenantIds.includes(user?.tenantId);

  useEffect(() => {
    if (!user) return;
    
    const fetchChannelsAndChat = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (isMock) {
          setChannels([]);
          setMessages([]);
        } else {
          const channelRes = await listChannels();
          setChannels(channelRes.channels || channelRes);
          
          if (channelRes.channels && channelRes.channels.length > 0) {
            const firstChannel = channelRes.channels[0];
            const msgRes = await getMessages(firstChannel.id, jwt);
            setMessages(msgRes.messages || msgRes);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchChannelsAndChat();
  }, [user, jwt]); // Add jwt to dependencies since it's used in getMessages

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Chat Dashboard</h1>
      <ChatContainer />
    </div>
  )
}

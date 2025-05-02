// This sets up the Stream Chat React SDK provider for the Multi-tenant chat
// It ensures that all pages/components can use Stream Chat context and components.

import React, { useEffect, useState } from 'react';
import { StreamChat } from 'stream-chat';
import {
  Chat,
  Channel,
  ChannelHeader,
  MessageList,
  MessageInput,
} from 'stream-chat-react';
import 'stream-chat-react/dist/css/index.css';
import { getStreamToken } from './api';

const streamKey = process.env.NEXT_PUBLIC_STREAM_KEY!;

export function useStreamToken() {
  const [token, setToken] = useState<string|null>(null);
  useEffect(() => {
    const fetchToken = async () => {
      const jwt = localStorage.getItem("token");
      if (!jwt) return;
      try {
        const streamToken = await getStreamToken();
        setToken(streamToken);
      } catch (e) {
        setToken(null);
      }
    };
    fetchToken();
  }, []);
  return token;
}

export function StreamChatProvider({ userId, userName, children }: { userId: string; userName: string; children: React.ReactNode }) {
  const [client, setClient] = useState<StreamChat | null>(null);
  const [loading, setLoading] = useState(true);
  const token = useStreamToken();

  useEffect(() => {
    let chatClient: StreamChat;
    async function connect() {
      if (!token) return;
      chatClient = StreamChat.getInstance(streamKey);
      await chatClient.connectUser({ id: userId, name: userName }, token);
      setClient(chatClient);
      setLoading(false);
    }
    connect();
    return () => {
      if (chatClient) chatClient.disconnectUser();
    };
  }, [userId, userName, token]);

  if (loading || !client) return <div>Loading chat...</div>;
  return <Chat client={client}>{children}</Chat>;
}

// Example usage in a page or component:
//
// import { StreamChatProvider } from '@/lib/stream-provider';
//
// <StreamChatProvider userId={user.id} userName={user.name}>
//   <Channel channel={client.channel('messaging', 'general')}>
//     <ChannelHeader />
//     <MessageList />
//     <MessageInput />
//   </Channel>
// </StreamChatProvider>

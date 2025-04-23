// This file sets up the Stream Chat React SDK provider for your Next.js app.
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

export function StreamChatProvider({ userId, userName, children }: { userId: string; userName: string; children: React.ReactNode }) {
  const [client, setClient] = useState<StreamChat | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let chatClient: StreamChat;
    async function connect() {
      const token = await getStreamToken();
      chatClient = StreamChat.getInstance(streamKey);
      await chatClient.connectUser({ id: userId, name: userName }, token);
      setClient(chatClient);
      setLoading(false);
    }
    connect();
    return () => {
      if (chatClient) chatClient.disconnectUser();
    };
  }, [userId, userName]);

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

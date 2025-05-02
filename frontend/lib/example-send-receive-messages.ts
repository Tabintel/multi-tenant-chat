// Example usage of Stream Chat SDK to send and receive messages in your frontend
// This assumes you already connected a user using connectUser from stream-chat.ts

import { getChatClient } from "./stream-chat"

// Send a message to a channel
export async function sendMessage(channelId: string, text: string) {
  const client = getChatClient()
  if (!client) throw new Error("Stream Chat client not initialized")

  // Get (or create) the channel
  const channel = client.channel("messaging", channelId)
  await channel.watch() // Ensure channel state is loaded

  // Send the message
  const response = await channel.sendMessage({ text })
  return response.message
}

// Listen for new messages in a channel
export function listenForMessages(channelId: string, onMessage: (msg: any) => void) {
  const client = getChatClient()
  if (!client) throw new Error("Stream Chat client not initialized")

  const channel = client.channel("messaging", channelId)
  channel.watch()

  // Subscribe to new message events
  channel.on("message.new", event => {
    if (event.message) {
      onMessage(event.message)
    }
  })

  // Return an unsubscribe function
  return () => {
    channel.off("message.new")
  }
}

// Example usage:
// await sendMessage("general", "Hello world!")
// const unsubscribe = listenForMessages("general", msg => console.log(msg))
// ...later: unsubscribe() to stop listening
